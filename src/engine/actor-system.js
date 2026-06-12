// src/engine/actor-system.js — External actor meetings.
// Each generic problem lists external_actors. Once per turn (1 action point)
// the player can summon one for a meeting: the actor's name is matched to an
// archetype by keyword, and one eligible offer from that archetype is made.
// Accepting applies the offer's effects; some offers carry exposure risk.

import actorData from '../../Hardcoded things/external_actors.json';
import { random, randomPick } from '../utils/random.js';
import { addHeat } from './heat-system.js';
import { interpolateText } from './generic-problems.js';

// Content robustness: generated JSON sometimes carries trailing spaces in
// keys, keywords and ids ("union ", "fixer "). Normalize once at load so a
// stray space can never produce a silent dead-end.
const ARCHETYPES = {};
for (const [k, v] of Object.entries(actorData.archetypes ?? {})) {
  ARCHETYPES[String(k).trim()] = v;
}
const FALLBACK_KEY = String(actorData.fallback ?? 'fixer').trim();

export function matchArchetype(actorName) {
  const name = (actorName ?? '').toLowerCase().trim();
  for (const [key, arch] of Object.entries(ARCHETYPES)) {
    const hit = (arch.keywords ?? []).some(kw => {
      const k = String(kw).trim().toLowerCase();
      return k.length > 0 && name.includes(k);
    });
    if (hit) return key;
  }
  return ARCHETYPES[FALLBACK_KEY] ? FALLBACK_KEY : Object.keys(ARCHETYPES)[0];
}

export class ActorSystem {
  constructor(state) {
    this.state = state;
  }

  // Summon an actor for the current decision. Costs 1 action point.
  summon(actorName, decision) {
    const s = this.state;
    if (s.meetingUsedTurn === s.turn) return { ok: false, msg: 'You have already taken a meeting today.' };
    if ((s.actionPoints ?? 0) <= 0)   return { ok: false, msg: 'No hours left in the day.' };
    if (s.pendingMeeting)             return { ok: false, msg: 'Someone is already waiting in your office.' };

    const archKey = matchArchetype(actorName);
    const arch = ARCHETYPES[archKey];
    if (!arch) return { ok: false, msg: 'They never showed.' };

    // Pick one offer — reveal_scheming offers only make sense if there IS a
    // recommendation today
    const hasRec = Object.keys(s.pendingDecisionRecommendations ?? {}).length > 0;
    const pool = (arch.offers ?? []).filter(o => !o.accept?.reveal_scheming || hasRec);
    const offer = randomPick(pool.length ? pool : arch.offers);
    if (!offer) return { ok: false, msg: 'They had nothing for you.' };

    s.actionPoints = (s.actionPoints ?? 0) - 1;
    s.meetingUsedTurn = s.turn;
    s.pendingMeeting = {
      actorName,
      archetype: archKey,
      label: arch.label ?? 'VISITOR',
      greeting: interpolateText(randomPick(arch.greeting) ?? '', s.city),
      offer,
      decisionId: decision?.id ?? null,
    };
    console.log(`[Meeting] ${actorName} (${archKey}) — offer: ${offer.id}`);
    return { ok: true };
  }

  // Resolve the pending meeting. accept=false applies the decline effects.
  resolve(accept, scandalSystem) {
    const s = this.state;
    const m = s.pendingMeeting;
    if (!m) return { ok: false, msg: 'Nobody is waiting.' };
    s.pendingMeeting = null;

    const arch = ARCHETYPES[String(m.archetype ?? '').trim()] ?? {};
    const fx = accept ? (m.offer.accept ?? {}) : (m.offer.decline ?? {});
    const lines = [];

    // ── Apply effect ops ────────────────────────────────────────────────────
    if (fx.budget)   s.shiftBudget(fx.budget);
    if (fx.approval) s.shiftApproval(fx.approval);
    if (fx.heat)     addHeat(s, fx.heat, `meeting_${m.archetype}`);

    if (fx.trust_domain) {
      const adv = s.findAdvisor?.(String(fx.trust_domain.id ?? '').trim());
      if (adv && !adv.betrayed) adv.trust = Math.max(0, Math.min(100, (adv.trust ?? 50) + (fx.trust_domain.n ?? 0)));
    }
    if (fx.agenda_domain) {
      const adv = s.findAdvisor?.(String(fx.agenda_domain.id ?? '').trim());
      if (adv && !adv.betrayed) adv.agendaProgress = Math.max(0, Math.min(100, (adv.agendaProgress ?? 0) + (fx.agenda_domain.n ?? 0)));
    }

    // Today's-decision modifiers, consumed by resolveDecision
    if (!s.decisionMods) s.decisionMods = {};
    if (fx.scandal_shield_today) s.decisionMods.scandalHalf = true;
    if (fx.spin_today)           s.decisionMods.spin = 3;

    // Intel: verify whether today's recommendation is honest
    if (fx.reveal_scheming) {
      lines.push(this._schemingReport());
    }

    // Risk roll (accepting shady help can surface)
    if (accept && fx.risk && random() < (fx.risk.chance ?? 0)) {
      scandalSystem?._applyScandal({
        id: `meeting_${String(m.offer.id ?? 'offer').trim()}_${s.turn}`,
        title: (fx.risk.title ?? `${m.actorName} Deal Exposed`).trim(),
        severity_tier: String(fx.risk.tier ?? 'moderate').trim(),
      }, 'meeting');
      lines.push('It did not stay quiet.');
    }

    const exitLine = interpolateText(
      randomPick(accept ? (arch.accept_line ?? []) : (arch.decline_line ?? [])) ?? '', s.city);
    if (exitLine) lines.unshift(exitLine);

    s.lastMeetingResult = { actorName: m.actorName, accepted: accept, lines, turn: s.turn };
    s.recentComments = [
      `${m.actorName} was seen leaving city hall this afternoon.`,
      ...(s.recentComments ?? []),
    ].slice(0, 5);

    console.log(`[Meeting] ${m.actorName}: ${accept ? 'ACCEPTED' : 'DECLINED'} ${m.offer.id}`);
    return { ok: true, lines };
  }

  // Honest verdict on today's domain-advisor recommendation
  _schemingReport() {
    const s = this.state;
    const meta = s.pendingRecMeta ?? {};
    const recIds = Object.keys(s.pendingDecisionRecommendations ?? {});
    if (!recIds.length) return 'They had nothing on today\'s advice.';

    const anyScheming = recIds.some(id => meta[id]?.scheming);
    if (anyScheming) {
      const adv = s.advisors.find(a => a.id === recIds.find(id => meta[id]?.scheming));
      return `Their verdict on today's advice: "${adv?.name ?? 'Your advisor'} is steering you into a wall. The reasoning is rehearsed. Decide accordingly."`;
    }
    return 'Their verdict on today\'s advice: "It checks out. Whatever else your advisor wants, today they\'re playing it straight."';
  }
}

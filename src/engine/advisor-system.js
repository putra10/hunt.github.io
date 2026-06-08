// src/engine/advisor-system.js
import { randomPick } from '../utils/random.js';

// ── Crisis Secret Options (mirrored from crisis-screen for engine use) ────────
export const ADVISOR_SECRET_CRISIS_OPTIONS = {
  finance:          { approval_delta: 2,  budget_delta: -30 },
  military_liaison: { approval_delta: 6,  budget_delta: -20 },
  urban_planning:   { approval_delta: 8,  budget_delta: -25 },
  religious_affairs:{ approval_delta: 7,  budget_delta: -10 },
  transport:        { approval_delta: 4,  budget_delta: -15 },
};

// ── Emergency Powers ──────────────────────────────────────────────────────────
// One-time panic actions per advisor. Shown in messenger when conditions are met.
export const EMERGENCY_POWERS = {
  finance: {
    label: 'EMERGENCY LOAN',
    desc:  'Secure emergency bridge financing. Stabilises the budget but dents public confidence.',
    note:  '+80M budget, −5 approval',
    condition: (s, adv) => s.budget < -50 && (adv.trust ?? 50) >= 45,
    apply:     (s) => { s.shiftBudget(80); s.shiftApproval(-5); },
  },
  military_liaison: {
    label: 'MARSHAL FORCES',
    desc:  'Deploy military presence. Suppresses the active unrest event at zero political cost.',
    note:  'Clears riot/demo/strike instantly',
    condition: (s, adv) => !!s.pendingUnrest && (adv.trust ?? 50) >= 50,
    apply:     (s) => { s.pendingUnrest = null; },
  },
  urban_planning: {
    label: 'COMMUNITY INITIATIVE',
    desc:  'Launch emergency community outreach. Expensive but boosts morale quickly.',
    note:  '+10 approval, −20M budget',
    condition: (s, adv) => s.approval < 45 && (adv.trust ?? 50) >= 45,
    apply:     (s) => { s.shiftApproval(10); s.shiftBudget(-20); },
  },
  religious_affairs: {
    label: 'UNITY SERMON',
    desc:  'Call a city-wide day of reflection. Temporarily unites divided factions.',
    note:  '+7 approval',
    condition: (s, adv) => s.approval < 50 && (adv.trust ?? 50) >= 45,
    apply:     (s) => { s.shiftApproval(7); },
  },
  transport: {
    label: 'EMERGENCY RELIEF ROUTES',
    desc:  'Open priority supply corridors. Eases economic strain on the ground.',
    note:  '+15M budget, −3 approval',
    condition: (s, adv) => s.budget < 0 && (adv.trust ?? 50) >= 45,
    apply:     (s) => { s.shiftBudget(15); s.shiftApproval(-3); },
  },
};

const AGENDA_MAX = 100;
const AGENDA_TICK = 5;
const BETRAYAL_THRESHOLD = 80;

// ── Relationship types ────────────────────────────────────────────────────────
// Advisors start at neutral. Relationship shifts over time based on player
// decisions, random events, and domain attention.
// romantic → extra loyalty each turn, but romance exposure is a scandal risk.
export const RELATIONSHIP_TYPES = ['neutral', 'trust', 'rivalry', 'romantic'];

// Per-turn bonuses by relationship type (applied in tickRelationships)
const RELATIONSHIP_BONUS = {
  trust:    { trustMod: +2 },           // High trust: decay slowed
  rivalry:  { trustMod: -4 },           // Active rivalry: decay accelerated
  neutral:  { trustMod: 0 },
  romantic: { trustMod: +4, scandalRisk: 0.05 }, // Loyalty spike, scandal risk
};

export class AdvisorSystem {
  constructor(state) {
    this.state = state;
  }

  tickAgendas(onBetrayal) {
    const s = this.state;
    for (const advisor of s.advisors) {
      if (advisor.betrayed) continue;

      advisor.agendaProgress = Math.min(AGENDA_MAX, (advisor.agendaProgress ?? 0) + AGENDA_TICK);

      // Layer 1: base trust decay — 2pts/turn regardless of relationship
      // Relationship modifier is applied on top in tickRelationships()
      advisor.trust = Math.max(0, (advisor.trust ?? 50) - 2);

      if (advisor.agendaProgress >= BETRAYAL_THRESHOLD) {
        this.triggerBetrayal(advisor, onBetrayal);
      }
    }
  }

  // ── Personal Layer: relationship evolution ────────────────────────────────────
  // Called once per turn after tickAgendas.
  // Applies relationship-based trust modifiers and checks romance exposure risk.
  tickRelationships(scandalSystem) {
    const s = this.state;
    for (const advisor of s.advisors) {
      if (advisor.betrayed) continue;
      const rel = advisor.relationshipType ?? 'neutral';
      const bonus = RELATIONSHIP_BONUS[rel] ?? RELATIONSHIP_BONUS.neutral;

      // Apply relationship trust modifier (stacks with base decay from tickAgendas)
      if (bonus.trustMod) {
        advisor.trust = Math.max(0, Math.min(100, (advisor.trust ?? 50) + bonus.trustMod));
      }

      // Romance exposure risk — 5% per turn if romantic and not yet exposed
      if (rel === 'romantic' && !advisor.romanceExposed && bonus.scandalRisk) {
        if (Math.random() < bonus.scandalRisk && scandalSystem) {
          scandalSystem.triggerRomanceExposure(advisor.name);
          // Once exposed, relationship degrades unless city culture is lenient
          const severityAfterExposure = s.city?.city_id
            ? (scandalSystem.triggerRomanceExposure.lastSeverity ?? 'moderate')
            : 'moderate';
          if (['career_ending', 'major'].includes(severityAfterExposure)) {
            advisor.relationshipType = 'rivalry';
          }
        }
      }
    }
  }

  // ── Relationship shift ─────────────────────────────────────────────────────────
  // Called from consequence-sim or explicit player action (messenger screen).
  // delta: positive = warmer, negative = colder/worse
  shiftRelationship(advisorId, delta) {
    const s = this.state;
    const advisor = s.advisors.find(a => a.id === advisorId);
    if (!advisor || advisor.betrayed) return;

    const order = ['rivalry', 'neutral', 'trust', 'romantic'];
    const current = order.indexOf(advisor.relationshipType ?? 'neutral');
    if (current === -1) return;

    const next = Math.max(0, Math.min(order.length - 1, current + delta));
    advisor.relationshipType = order[next];

    // Romance can only develop from trust, not from neutral directly
    // (prevent instant romantic jumps)
    if (advisor.relationshipType === 'romantic' && order[current] !== 'trust') {
      advisor.relationshipType = 'trust';
    }

    console.log(`[Relationship] ${advisor.name}: ${order[current]} → ${advisor.relationshipType}`);
  }

  triggerBetrayal(advisor, onBetrayal) {
    advisor.betrayed = true;
    advisor.agendaProgress = AGENDA_MAX;

    const line = advisor.dialogue?.betrayal ?? 'I can no longer serve you, Governor.';
    this.state.recentComments = [`⚠ BETRAYAL — ${advisor.name}: "${line}"`];

    // Betrayal costs approval; worse if relationship was romantic (public optics)
    const betrayalPenalty = advisor.relationshipType === 'romantic' ? -15 : -10;
    this.state.shiftApproval(betrayalPenalty);

    console.warn(`[BETRAYAL] ${advisor.name} (relationship: ${advisor.relationshipType ?? 'neutral'})`);
    if (onBetrayal) onBetrayal(advisor);
  }

  // ── Advisor Recommendations ───────────────────────────────────────────────────
  // Called in processTurn after decision is loaded. Domain-matched advisors
  // suggest the option with the best approval outcome.

  generateRecommendations(decision) {
    const s = this.state;
    s.pendingDecisionRecommendations = {};
    if (!decision) return;

    for (const advisor of s.advisors) {
      if (advisor.betrayed) continue;
      if (advisor.id !== decision._domain) continue;

      let best = 0;
      decision.options.forEach((opt, i) => {
        const aD = opt.consequences?.approval_delta ?? 0;
        const bD = best === 0 ? -Infinity : (decision.options[best].consequences?.approval_delta ?? 0);
        if (aD > bD) best = i;
      });
      s.pendingDecisionRecommendations[advisor.id] = best;
      console.log(`[Advisor] ${advisor.name} recommends option ${best} for "${decision.id}"`);
    }
  }

  generateBriefings() {
    const s = this.state;
    const advisors = s.advisors.filter(a => !a.betrayed);
    const comments = [];

    for (const advisor of advisors) {
      const dialogue = advisor.dialogue;
      if (!dialogue) continue;

      const rel   = advisor.relationshipType ?? 'neutral';
      const trust = advisor.trust ?? 50;
      let pool;
      if (rel === 'rivalry')       pool = dialogue.threat ?? dialogue.disagreement;
      else if (rel === 'romantic') pool = dialogue.briefing;
      else if (s.approval < 30)   pool = dialogue.roast;
      else if (trust < 40)        pool = dialogue.threat ?? dialogue.disagreement;
      else                        pool = dialogue.briefing;

      let line = randomPick(Array.isArray(pool) ? pool : [pool]);

      if (trust > 70) {
        const intel = this._generateIntel(advisor, s);
        if (intel) line = `[INTEL] ${intel}`;
      }

      if (line) {
        const prefix = rel === 'romantic' ? '💬' : rel === 'rivalry' ? '⚔' : '';
        comments.push(`${prefix}${advisor.name}: "${line}"`);
      }
    }

    if (comments.length) {
      s.recentComments = comments.slice(0, 3);
    }
  }

  _generateIntel(advisor, s) {
    const rate       = s.getTaxRate ? s.getTaxRate() : 50;
    const nextIncome = Math.round(rate * (s.approval / 100));
    switch (advisor.id) {
      case 'finance':
        if (s.budget + nextIncome < 0)
          return `Next turn budget projection: ${s.budget + nextIncome}M. Deficit likely — act now.`;
        if (s.consecutiveDeficitTurns >= 1)
          return `Deficit streak at ${s.consecutiveDeficitTurns} turn(s). Contract demand will spike soon.`;
        return null;
      case 'military_liaison':
        if (s.getAvailableCrises?.().length > 0 && [4, 8, 12].includes(s.turn + 1))
          return `Crisis window opens next turn. ${s.getAvailableCrises().length} threat(s) eligible.`;
        if (s.pendingUnrest)
          return `Civil unrest is active. Military intervention available via emergency power.`;
        return null;
      case 'urban_planning':
        if (s.budget < 0 && s.approval < 42)
          return `Unrest threshold approaching. Approval at ${s.approval}% with budget deficit.`;
        if (s.approval < 50)
          return `Public sentiment fragile at ${s.approval}%. Community programs recommended.`;
        return null;
      default:
        return null;
    }
  }

  generateBribeOffers() {
    const s = this.state;
    const BRIBE_THRESHOLD = 60;
    const BRIBE_CHANCE    = 0.30;

    for (const advisor of s.advisors) {
      if (advisor.betrayed) continue;
      if (advisor.agendaProgress < BRIBE_THRESHOLD) continue;
      if ((s.pendingBribes ?? []).some(b => b.advisorId === advisor.id)) continue;
      if (Math.random() > BRIBE_CHANCE) continue;

      const cost = 50 + (advisor.competence_rating ?? 6) * 15;
      if (!s.pendingBribes) s.pendingBribes = [];
      s.pendingBribes.push({
        advisorId:       advisor.id,
        advisorName:     advisor.name,
        cost,
        agendaReduction: 30,
        trustGain:       15,
        scandalRisk:     0.25,
      });
      console.log(`[Bribe] ${advisor.name} offering deal (${cost}M)`);
    }
  }

  applyAbsenceEffects() {
    const s = this.state;
    const ABSENCE_PENALTY = {
      finance:          { budget: -5 },
      urban_planning:   { approval: -1 },
      transport:        { approval: -1 },
      military_liaison: { approval: -1 },
      religious_affairs:{ approval: -1 },
    };
    for (const advisor of s.advisors) {
      if (advisor.betrayed) continue;
      if ((advisor.trust ?? 50) >= 30) continue;
      const penalty = ABSENCE_PENALTY[advisor.id];
      if (!penalty) continue;
      if (penalty.budget)   s.shiftBudget(penalty.budget);
      if (penalty.approval) s.shiftApproval(penalty.approval);
      console.log(`[Absence] ${advisor.name} trust<30 — silent penalty`);
    }
  }
}

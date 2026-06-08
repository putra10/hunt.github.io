// src/engine/game-state.js — Single source of truth
import { getNextGenericProblem } from './generic-problems.js';
import { seed } from '../utils/random.js';

export const state = {
  settings: {
    sound:       false,
    feedSpeed:   'normal',
    scandalFreq: 'normal',
    language:    'english',
  },

  city: null,
  turn: 1,
  approval: 50,
  budget: 0,

  activeCrises: [],
  resolvedCrises: [],
  pendingCrisis: null,

  advisors: [],

  pastDecisions: [],
  pastCrises: [],

  activeScandals: [],
  resolvedScandals: [],

  flags: {},
  pendingBetrayals: [],
  pendingBribes: [],
  pendingScandal: null,

  pendingContractOffers: [],
  activeContractDeals: [],
  acceptedContracts: [],
  declinedContracts: [],
  lastContractOfferTurn: 0,

  consecutiveDeficitTurns: 0,
  pendingUnrest: null,
  pendingDecisionRecommendations: {},

  presentedDecisions: [],
  decisionsThisTurn: 0,
  maxDecisionsThisTurn: 1,

  recentComments: [],

  // ── Lifecycle ─────────────────────────────────────────────────────────

  loadCity(cityData) {
    seed((Date.now() ^ (Math.random() * 0xFFFFFF | 0)) >>> 0);
    this.city = cityData;
    this.turn = 1;
    this.approval = cityData.opening_sequence.starting_stats.approval_rating;
    this.budget = cityData.opening_sequence.starting_stats.budget;
    this.activeCrises = [];
    this.resolvedCrises = [];
    this.pendingCrisis = null;
    const TIER_ADVISOR_COUNTS = { easy: 5, medium: 5, hard: 4, extreme: 3, war: 3 };
    const targetCount = cityData.advisor_count ?? TIER_ADVISOR_COUNTS[cityData.tier] ?? 5;
    const shuffled = [...cityData.advisors].sort(() => Math.random() - 0.5);
    const selectedAdvisors = shuffled.slice(0, Math.min(targetCount, shuffled.length));
    this.advisors = selectedAdvisors.map(a => ({
      ...a,
      trust: cityData.opening_sequence.starting_stats.advisor_trust_levels?.[a.id] ?? 50,
      agendaProgress: a.agenda_progress ?? 0,
      betrayed: false,
      romanceExposed: false,
      relationshipType: 'neutral',
      emergencyPowerUsed: false,
    }));
    this.pastDecisions = [];
    this.pastCrises = [];
    this.activeScandals = [];
    this.resolvedScandals = [];
    this.flags = {};
    this.presentedDecisions = [];
    this.recentComments = [];
    this.decisionsThisTurn = 0;
    this.maxDecisionsThisTurn = 1;
    this.pendingBribes = [];
    this.pendingScandal = null;
    this.pendingBetrayals = [];
    this.pendingContractOffers = [];
    this.activeContractDeals = [];
    this.acceptedContracts = [];
    this.declinedContracts = [];
    this.lastContractOfferTurn = 0;
    this.consecutiveDeficitTurns = 0;
    this.pendingUnrest = null;
    this.pendingDecisionRecommendations = {};
  },

  // ── Decision pacing ───────────────────────────────────────────────────

  getNextDecision() {
    const CRISIS_ONLY_TURNS = [4, 8, 12];
    if (CRISIS_ONLY_TURNS.includes(this.turn) && this.activeCrises.length > 0) return null;
    return getNextGenericProblem(this);
  },

  recordDecisionResolved() {
    this.decisionsThisTurn++;
  },

  decisionCapReached() {
    return this.decisionsThisTurn >= this.maxDecisionsThisTurn;
  },

  // ── Economy ───────────────────────────────────────────────────────────

  getTaxRate() {
    if (this.city?.tax_rate !== undefined) return this.city.tax_rate;
    const TIER_RATES = { easy: 80, medium: 60, hard: 40, extreme: 25, war: 15 };
    return TIER_RATES[this.city?.tier] ?? 50;
  },

  // ── Advisors ─────────────────────────────────────────────────────────

  getBriefingAdvisors() {
    return this.advisors.filter(a => !a.betrayed);
  },

  getAdvisor(id) {
    return this.advisors.find(a => a.id === id);
  },

  // ── Crises ────────────────────────────────────────────────────────────

  getAvailableCrises() {
    if (!this.city) return [];
    return this.city.crises.filter(c =>
      !this.resolvedCrises.includes(c.id) &&
      !this.activeCrises.includes(c.id) &&
      this.turn >= (c.turn_min ?? 1) &&
      this.turn <= (c.turn_max ?? 12)
    );
  },

  selectCrisisPool() {
    const available = this.city.crises.filter(c => !c.war_mode);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length)).map(c => c.id);
  },

  shouldTriggerCrisis() {
    const CRISIS_TURNS = [4, 8, 12];
    return CRISIS_TURNS.includes(this.turn) && this.getAvailableCrises().length > 0;
  },

  // ── Stats ─────────────────────────────────────────────────────────────

  shiftApproval(delta) {
    this.approval = Math.max(0, Math.min(100, this.approval + delta));
  },

  shiftBudget(delta) {
    this.budget += delta;
  },

  // ── Flags ─────────────────────────────────────────────────────────────

  setFlag(key, value = true) {
    this.flags[key] = value;
  },

  hasFlag(key) {
    return !!this.flags[key];
  },

  // ── Persistence ──────────────────────────────────────────────────────

  serialize() {
    return JSON.stringify({
      version: '0.1.0',
      settings: this.settings,
      cityId: this.city?.city_id,
      turn: this.turn,
      approval: this.approval,
      budget: this.budget,
      activeCrises: this.activeCrises,
      resolvedCrises: this.resolvedCrises,
      pendingCrisis: this.pendingCrisis,
      advisors: this.advisors.map(a => ({
        id: a.id,
        trust: a.trust,
        agendaProgress: a.agendaProgress,
        betrayed: a.betrayed,
        romanceExposed: a.romanceExposed,
        relationshipType: a.relationshipType ?? 'neutral',
        emergencyPowerUsed: a.emergencyPowerUsed ?? false,
      })),
      pastDecisions: this.pastDecisions,
      pastCrises: this.pastCrises,
      activeScandals: this.activeScandals,
      resolvedScandals: this.resolvedScandals,
      presentedDecisions: this.presentedDecisions,
      decisionsThisTurn: this.decisionsThisTurn,
      maxDecisionsThisTurn: this.maxDecisionsThisTurn,
      pendingBribes: this.pendingBribes,
      pendingScandal: this.pendingScandal,
      pendingContractOffers: this.pendingContractOffers,
      activeContractDeals: this.activeContractDeals,
      acceptedContracts: this.acceptedContracts,
      declinedContracts: this.declinedContracts,
      lastContractOfferTurn: this.lastContractOfferTurn,
      consecutiveDeficitTurns: this.consecutiveDeficitTurns,
      pendingUnrest: this.pendingUnrest,
      flags: this.flags,
    });
  },

  deserialize(data, cityData) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    this.loadCity(cityData);
    if (parsed.settings) Object.assign(this.settings, parsed.settings);
    this.turn                 = parsed.turn;
    this.approval             = parsed.approval;
    this.budget               = parsed.budget;
    this.activeCrises         = parsed.activeCrises ?? [];
    this.resolvedCrises       = parsed.resolvedCrises ?? [];
    this.pendingCrisis        = parsed.pendingCrisis ?? null;
    this.pastDecisions        = parsed.pastDecisions ?? [];
    this.pastCrises           = parsed.pastCrises ?? [];
    this.activeScandals       = parsed.activeScandals ?? [];
    this.resolvedScandals     = parsed.resolvedScandals ?? [];
    this.presentedDecisions   = parsed.presentedDecisions ?? [];
    this.decisionsThisTurn    = parsed.decisionsThisTurn ?? 0;
    this.maxDecisionsThisTurn = parsed.maxDecisionsThisTurn ?? 1;
    this.pendingBribes        = parsed.pendingBribes ?? [];
    this.pendingScandal       = parsed.pendingScandal ?? null;
    this.pendingContractOffers  = parsed.pendingContractOffers ?? [];
    this.activeContractDeals    = parsed.activeContractDeals ?? [];
    this.acceptedContracts      = parsed.acceptedContracts ?? [];
    this.declinedContracts      = parsed.declinedContracts ?? [];
    this.lastContractOfferTurn  = parsed.lastContractOfferTurn ?? 0;
    this.consecutiveDeficitTurns = parsed.consecutiveDeficitTurns ?? 0;
    this.pendingUnrest           = parsed.pendingUnrest ?? null;
    this.flags                   = parsed.flags ?? {};

    (parsed.advisors ?? []).forEach(saved => {
      const advisor = this.getAdvisor(saved.id);
      if (advisor) {
        advisor.trust              = saved.trust;
        advisor.agendaProgress     = saved.agendaProgress;
        advisor.betrayed           = saved.betrayed;
        advisor.romanceExposed     = saved.romanceExposed ?? false;
        advisor.relationshipType   = saved.relationshipType ?? 'neutral';
        advisor.emergencyPowerUsed = saved.emergencyPowerUsed ?? false;
      }
    });
  },
};

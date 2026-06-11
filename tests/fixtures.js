// Shared test fixtures for the GOVERNED engine tests.

// The engine's saveGame() touches localStorage, which doesn't exist in Node.
// Provide a tiny in-memory stand-in before any engine module runs.
globalThis.localStorage ??= {
  _s: {},
  setItem(k, v) { this._s[k] = String(v); },
  getItem(k)    { return this._s[k] ?? null; },
  removeItem(k) { delete this._s[k]; },
  clear()       { this._s = {}; },
};

export const ADVISOR_IDS = [
  'finance', 'military_liaison', 'urban_planning', 'religious_affairs', 'transport',
];

export function makeAdvisor(id) {
  return { id, name: id.toUpperCase(), domain: id, dialogue: {}, competence_rating: 6 };
}

export function makeCity(overrides = {}) {
  return {
    city_id: 'testville',
    city_name: 'Testville',
    tier: 'medium',
    tax_rate: 60,
    advisor_count: 5,
    opening_sequence: {
      starting_stats: { approval_rating: 50, budget: 100, advisor_trust_levels: {} },
    },
    advisors: ADVISOR_IDS.map(makeAdvisor),
    crises: [],
    scandals: [],
    comment_library: {
      positive: ['+'], neutral: ['~'], negative: ['-'], crisis: ['!'],
    },
    ...overrides,
  };
}

import { describe, it, expect, beforeEach } from 'vitest';
import { makeCity } from './fixtures.js';
import { state } from '../src/engine/game-state.js';
import { AdvisorSystem } from '../src/engine/advisor-system.js';
import { ScandalSystem } from '../src/engine/scandal-system.js';
import { ConsequenceSim } from '../src/engine/consequence-sim.js';

let sim;

beforeEach(() => {
  state.loadCity(makeCity());
  const advisorSystem = new AdvisorSystem(state);
  const scandalSystem = new ScandalSystem(state);
  sim = new ConsequenceSim(state, advisorSystem, scandalSystem);
});

describe('consequence-sim', () => {
  it('applies approval and budget deltas', () => {
    sim.apply({ approval_delta: -7, budget_delta: 30 });
    expect(state.approval).toBe(43);
    expect(state.budget).toBe(130);
  });

  it('applies advisor trust effects and counters agenda on positive trust', () => {
    const adv = state.getAdvisor('finance');
    adv.trust = 50;
    adv.agendaProgress = 40;
    sim.apply({ advisor_effects: [{ advisor_id: 'finance', trust_delta: 10 }] });
    expect(adv.trust).toBe(60);
    // positive trust_delta counters agenda by floor(delta * 1.5)
    expect(adv.agendaProgress).toBe(40 - 15);
  });

  it('triggers betrayal when agenda crosses the threshold', () => {
    const adv = state.getAdvisor('transport');
    adv.agendaProgress = 75;
    sim.apply({ advisor_effects: [{ advisor_id: 'transport', betrayal_risk_delta: 10 }] });
    expect(adv.betrayed).toBe(true);
  });

  it('fires a scandal at 100% scandal_risk (synthesized when city has none)', () => {
    const before = state.approval;
    sim.apply({ scandal_risk: 100 }, { sourceId: 'test_decision' });
    expect(state.activeScandals.length).toBe(1);
    expect(state.approval).toBeLessThan(before);
    // surprise scandal → reveal popup queued
    expect(state.pendingScandalReveals.length).toBe(1);
    expect(state.pendingScandalReveals[0].source).toBe('test_decision');
  });

  it('queues an unlocked crisis', () => {
    sim.apply({ unlocks_crisis_id: 'flood_two' });
    expect(state.pendingCrisis).toBe('flood_two');
  });
});

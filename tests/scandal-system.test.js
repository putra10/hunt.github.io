import { describe, it, expect, beforeEach } from 'vitest';
import { makeCity } from './fixtures.js';
import { state } from '../src/engine/game-state.js';
import { ScandalSystem, SCANDAL_SEVERITY } from '../src/engine/scandal-system.js';

let ss;

beforeEach(() => {
  state.loadCity(makeCity());
  ss = new ScandalSystem(state);
});

describe('scandal penalties', () => {
  it('respects the city-authored approval_penalty over the tier default', () => {
    state.approval = 50;
    ss._applyScandal({ id: 's1', title: 'Custom Hit', severity_tier: 'moderate', approval_penalty: -14 });
    expect(state.approval).toBe(36); // -14, not the moderate tier's -12
  });

  it('falls back to the tier penalty when no authored value exists', () => {
    state.approval = 50;
    ss._applyScandal({ id: 's2', title: 'Generic', severity_tier: 'major' });
    expect(state.approval).toBe(50 + SCANDAL_SEVERITY.major.approvalPenalty);
  });

  it('survives an invalid severity_tier (falls back to minor)', () => {
    state.approval = 50;
    expect(() => ss._applyScandal({ id: 's3', title: 'Typo Tier', severity_tier: 'catastrophic' })).not.toThrow();
    expect(state.activeScandals[0].severity_tier).toBe('minor');
  });

  it('queues a reveal popup for surprise scandals but not accepted ones', () => {
    ss._applyScandal({ id: 's4', title: 'Surprise', severity_tier: 'minor' }, 'some_decision');
    expect(state.pendingScandalReveals.length).toBe(1);
    ss._applyScandal({ id: 's5', title: 'Chosen', severity_tier: 'minor' }, 'accepted');
    expect(state.pendingScandalReveals.length).toBe(1); // unchanged
  });
});

describe('scandal responses', () => {
  it('non-career responses apply base penalty plus modifiers', () => {
    state.approval = 50;
    const scandal = { id: 'r1', severity_tier: 'moderate', approval_penalty: -12 };
    const result = ss.applyResponse(scandal, 'fire_advisor'); // -20M, +8%, agendas -15
    expect(result.gameOver).toBe(false);
    expect(state.approval).toBe(50 - 12 + 8);
  });

  it('resign_now is an immediate game over with no stat changes', () => {
    state.approval = 50;
    const scandal = { id: 'r2', severity_tier: 'career_ending' };
    const result = ss.applyResponse(scandal, 'resign_now');
    expect(result.gameOver).toBe(true);
    expect(state.approval).toBe(50);
  });

  it('romance exposure returns the severity and marks the advisor', () => {
    state.city.romance_exposure = { severity: 'major', flavour: null };
    const adv = state.advisors[0];
    const severity = ss.triggerRomanceExposure(adv.name);
    expect(severity).toBe('major');
    expect(adv.romanceExposed).toBe(true);
  });
});

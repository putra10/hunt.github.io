import { describe, it, expect, beforeEach } from 'vitest';
import { makeCity, makeAdvisor } from './fixtures.js';
import { state } from '../src/engine/game-state.js';

describe('game-state save/load', () => {
  beforeEach(() => {
    state.loadCity(makeCity());
  });

  it('serialize/deserialize round-trips core state', () => {
    state.turn = 7;
    state.approval = 42;
    state.budget = -55;
    state.dirtyDeeds = { skimmed: 30, threats: 1, leaks: 0, exposed: 1 };

    const fin = state.getAdvisor('finance');
    fin.trust = 81;
    fin.agendaProgress = 33;
    fin.corruptPact = true;
    fin.pactTurns = 2;
    fin.totalSkimmed = 24;
    fin.relationshipType = 'trust';

    const saved = state.serialize();
    state.deserialize(saved, makeCity());

    expect(state.turn).toBe(7);
    expect(state.approval).toBe(42);
    expect(state.budget).toBe(-55);
    expect(state.dirtyDeeds.skimmed).toBe(30);

    const fin2 = state.getAdvisor('finance');
    expect(fin2.trust).toBe(81);
    expect(fin2.agendaProgress).toBe(33);
    expect(fin2.corruptPact).toBe(true);
    expect(fin2.pactTurns).toBe(2);
    expect(fin2.totalSkimmed).toBe(24);
    expect(fin2.relationshipType).toBe('trust');
  });

  it('restores the exact advisor roster from the save, not a reshuffle', () => {
    // 3-of-6 selection: loadCity randomly picks a subset each time —
    // deserialize must restore the SAVED subset every time (regression
    // test for the save-corruption bug).
    const six = ['finance', 'military_liaison', 'urban_planning',
                 'religious_affairs', 'transport', 'extra_advisor'].map(makeAdvisor);
    const city = makeCity({ advisor_count: 3, advisors: six, tier: 'extreme' });

    state.loadCity(city);
    const ids = state.advisors.map(a => a.id).sort();
    expect(ids.length).toBe(3);
    const saved = state.serialize();

    for (let i = 0; i < 10; i++) {
      state.deserialize(saved, city);
      expect(state.advisors.map(a => a.id).sort()).toEqual(ids);
    }
  });

  it('serializes pendingBetrayals, recentComments and endReason', () => {
    state.pendingBetrayals = [{ advisorId: 'finance', advisorName: 'FINANCE', line: 'x', relationship: 'neutral' }];
    state.recentComments = ['hello'];
    state.endReason = 'recalled';

    const saved = state.serialize();
    state.deserialize(saved, makeCity());

    expect(state.pendingBetrayals.length).toBe(1);
    expect(state.recentComments).toEqual(['hello']);
    expect(state.endReason).toBe('recalled');
  });

  it('shiftApproval clamps to 0..100', () => {
    state.approval = 5;
    state.shiftApproval(-20);
    expect(state.approval).toBe(0);
    state.shiftApproval(150);
    expect(state.approval).toBe(100);
  });
});

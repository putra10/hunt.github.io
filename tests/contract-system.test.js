import { describe, it, expect, beforeEach } from 'vitest';
import { makeCity } from './fixtures.js';
import { state } from '../src/engine/game-state.js';
import { ContractSystem } from '../src/engine/contract-system.js';

let cs;

beforeEach(() => {
  state.loadCity(makeCity());
  cs = new ContractSystem(state);
});

describe('contract installments', () => {
  it('pays out the FULL reward across installments (rounding remainder)', () => {
    state.budget = 0;
    state.pendingContractOffers = [{
      id: 't1', title: 'Test Deal', reward_budget: 100, duration: 3,
      approval_delta: 0, scandal_risk: 0,
    }];
    cs.acceptContract('t1');

    expect(state.activeContractDeals.length).toBe(1);
    const deal = state.activeContractDeals[0];
    expect(deal.installmentAmount).toBe(33);
    expect(deal.remainder).toBe(1);

    cs.processActiveContracts(); // +33
    cs.processActiveContracts(); // +33
    cs.processActiveContracts(); // +33 +1 remainder
    expect(state.budget).toBe(100);
    expect(state.activeContractDeals.length).toBe(0);
  });

  it('single-turn contracts pay immediately', () => {
    state.budget = 0;
    state.pendingContractOffers = [{
      id: 't2', title: 'Quick Deal', reward_budget: 80, duration: 1,
      approval_delta: 0, scandal_risk: 0,
    }];
    cs.acceptContract('t2');
    expect(state.budget).toBe(80);
  });

  it('accepting one competing offer marks the other as declined', () => {
    state.pendingContractOffers = [
      { id: 'a', title: 'A', reward_budget: 50, duration: 1, approval_delta: 0, scandal_risk: 0 },
      { id: 'b', title: 'B', reward_budget: 60, duration: 1, approval_delta: 0, scandal_risk: 0 },
    ];
    cs.acceptContract('a');
    expect(state.acceptedContracts).toContain('a');
    expect(state.declinedContracts).toContain('b');
    expect(state.pendingContractOffers.length).toBe(0);
  });
});

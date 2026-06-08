import { approvalSvClass, budgetSvClass } from '../ui-helpers.js';

export function renderTopBar(state) {
  const ac = approvalSvClass(state.approval);
  const bc = budgetSvClass(state.budget);
  const crises = state.activeCrises.length;
  return `
    <div class="tb">
      <div class="masthead">GOVERNED DISPATCH</div>
      <div class="stats">
        <div class="stat"><span class="sl">CITY</span><span class="sv w">${(state.city?.city_name ?? '—').toUpperCase()}</span></div>
        <div class="stat"><span class="sl">TURN</span><span class="sv a">${state.turn} / 12</span></div>
        <div class="stat"><span class="sl">APPROVAL</span><span class="sv ${ac}">${state.approval}%</span></div>
        <div class="stat"><span class="sl">BUDGET</span><span class="sv ${bc}">${state.budget}M</span></div>
        ${crises > 0 ? `<div class="stat"><span class="sl">ACTIVE</span><span class="sv r">${crises} CRISIS</span></div>` : ''}
      </div>
    </div>`;
}

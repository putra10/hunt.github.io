export function renderStoryCard(state, decision) {
  if (!decision) {
    return `
      <div class="kicker">DISPATCH - TURN ${state.turn}</div>
      <div class="headline">No pending decisions. City awaits your next move.</div>
      <div class="byline">END OF DISPATCH - WEEK ${state.turn * 6} OF YOUR TERM</div>
      <hr class="divider">
      <div class="sbody">All active decisions for this turn have been resolved. Advisors are standing by. Press End Turn to advance.</div>`;
  }
  return `
    <div class="kicker">${(decision.category ?? 'DECISION').toUpperCase()} - TURN ${state.turn}</div>
    <div class="headline">${decision.title}</div>
    <div class="byline">DISPATCH - WEEK ${state.turn * 6} OF YOUR TERM</div>
    <hr class="divider">
    <div class="sbody">${decision.body ?? decision.description ?? ''}</div>`;
}

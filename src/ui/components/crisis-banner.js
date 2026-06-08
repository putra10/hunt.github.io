export function renderCrisisBanner(state, crisis) {
  return `
    <div class="crisis-banner">
      <div class="crisis-icon">!</div>
      <div class="crisis-title-wrap">
        <div class="crisis-tag">CRISIS EVENT - TURN ${state.turn}</div>
        <div class="crisis-title">${crisis.name}</div>
      </div>
    </div>`;
}

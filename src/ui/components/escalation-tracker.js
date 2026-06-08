export function renderEscalationTracker(escalationPct) {
  return `
    <div class="crisis-escalation">
      <div class="esc-l">ESCALATION</div>
      <div class="esc-bar"><div class="esc-fill" style="width:${escalationPct}%"></div></div>
      <div class="esc-text">+5% scandal risk per turn delayed</div>
    </div>`;
}

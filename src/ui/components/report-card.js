export function renderReportCard(state) {
  const legacyBase = state.city?.opening_sequence?.intro_headline
    ?? `Your term in ${state.city?.city_name ?? 'the city'} concluded`;

  return `
    <div class="wiki-box">
      <div class="wiki-l">LEGACY PARAGRAPH</div>
      <div class="wiki-t">${legacyBase}. Final approval: <em>${state.approval}%</em>. Budget remaining: <em>${state.budget}M</em>. Crises survived: <em>${state.pastCrises.length}</em>.</div>
    </div>`;
}

import { renderTopBar } from '../components/top-bar.js';
import { renderReportCard } from '../components/report-card.js';

export class ReportScreen {
  static render(state) {
    const recalled = state.approval <= 0;
    const decisions = state.pastDecisions;

    const worstDecision = decisions.reduce((worst, d) => {
      const delta = d.consequences?.approval_delta ?? 0;
      return (worst === null || delta < worst.delta) ? { ...d, delta } : worst;
    }, null);

    // Domain scores from advisor trust
    const domainDefs = [
      { id: 'finance',           name: 'FINANCE'        },
      { id: 'military_liaison',  name: 'SECURITY'       },
      { id: 'urban_planning',    name: 'INFRASTRUCTURE' },
      { id: 'transport',         name: 'TRANSPORT'      },
    ];
    const domainColor = s => s >= 60 ? 'var(--color-green)' : s >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
    const domainGrade = s => s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor';

    const domainsHTML = domainDefs.map(d => {
      const adv   = state.advisors.find(a => a.id === d.id);
      const score = adv ? Math.round(adv.trust) : 50;
      const col   = domainColor(score);
      return `
        <div class="domain">
          <div class="d-name">${d.name}</div>
          <div class="d-bar-wrap"><div class="d-bar" style="width:${score}%;background:${col}"></div></div>
          <div class="d-score" style="color:${col}">${score} / 100 - ${domainGrade(score)}</div>
        </div>`;
    }).join('');

    const loyal = state.advisors.filter(a => !a.betrayed && a.trust >= 60).length;
    const total = state.advisors.length;

    const cityReaction = state.approval >= 60 ? 'Satisfied' : state.approval >= 40 ? 'Skeptical' : 'Outraged';
    const cityCol      = domainColor(state.approval);

    // Outcome
    let outcomeTitle, outcomeDesc, primaryCls;
    if (recalled) {
      outcomeTitle = 'RECALLED';
      outcomeDesc  = 'Public confidence collapsed. Your term ended early.';
      primaryCls   = '';
    } else if (state.approval >= 65) {
      outcomeTitle = 'INVITATION RECEIVED';
      outcomeDesc  = `Your ${state.approval}% approval earned recognition. A senior position awaits.`;
      primaryCls   = 'primary';
    } else {
      outcomeTitle = 'NO INVITATION';
      outcomeDesc  = `Your ${state.approval}% approval was noted but not rewarded. The city moves on.`;
      primaryCls   = '';
    }

    const roastBody = state.city?.opening_sequence?.intro_body
      ?? `Another governor, another term. The city has seen it all before. Some things improved, others didn't. History will record the numbers and forget the context.`;

    return `
      <div class="screen">
        ${renderTopBar(state)}
        <div class="report-screen">
          <div class="report-header">
            <div class="rh-kicker">END OF TERM - ${state.turn * 6} WEEKS IN OFFICE</div>
            <div class="rh-title">${recalled ? 'RECALLED - ' : ''}Final Report - ${state.city?.city_name ?? 'City'}</div>
            <div class="rh-sub">${recalled ? 'Public confidence collapsed.' : 'Term completed. That alone is an achievement.'}</div>
          </div>
          ${renderReportCard(state)}
          <div class="domain-grid">${domainsHTML}</div>
          <div class="verdict-grid">
            <div class="verdict">
              <div class="v-name">CITY REACTION</div>
              <div class="v-val" style="color:${cityCol}">${cityReaction}</div>
              <div class="v-label">${state.approval}% final approval</div>
            </div>
            <div class="verdict">
              <div class="v-name">ADVISOR LOYALTY</div>
              <div class="v-val" style="color:${domainColor(loyal / total * 100)}">${loyal} / ${total}</div>
              <div class="v-label">${loyal === total ? 'Full loyalty' : 'Some betrayals'}</div>
            </div>
            <div class="verdict">
              <div class="v-name">CRISES SURVIVED</div>
              <div class="v-val" style="color:var(--color-amber)">${state.pastCrises.length}</div>
              <div class="v-label">out of ${state.city?.crises?.length ?? '?'} possible</div>
            </div>
          </div>
          ${worstDecision ? `
            <div class="worst-box">
              <div class="worst-l">WORST DECISION</div>
              <div class="worst-t">Turn ${worstDecision.turn} - ${worstDecision.decisionId}. Approval delta: ${worstDecision.delta >= 0 ? '+' : ''}${worstDecision.delta}.</div>
            </div>` : ''}
          <div class="roast-box">
            <div class="roast-l">CITY SPEAKS</div>
            <div class="roast-t">"${roastBody}"</div>
          </div>
          <div class="outcome-section">
            <div class="outcome-text">
              <strong>${outcomeTitle}.</strong> ${outcomeDesc}
            </div>
            <div class="outcome-actions">
              <div class="oa-btn" id="btn-retry">Retry ${state.city?.city_name ?? 'City'}</div>
              <div class="oa-btn ${primaryCls}" id="btn-restart">Main Menu</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static bind(container) {
    container.querySelector('#btn-retry')?.addEventListener('click',   () => window.location.reload());
    container.querySelector('#btn-restart')?.addEventListener('click', () => window.location.reload());
  }
}

import { trustFillClass } from '../ui-helpers.js';

export function renderTrustBar(trust) {
  const fillCls = trustFillClass(trust);
  return `<div class="trust-bar"><div class="trust-fill ${fillCls}" style="width:${trust}%"></div></div>`;
}

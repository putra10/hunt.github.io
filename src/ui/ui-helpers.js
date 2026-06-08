// src/ui/ui-helpers.js — UI matching and formatting helpers

export function tagClass(tag) {
  switch ((tag || '').toUpperCase()) {
    case 'SAFE':                          return 'ts';
    case 'BOLD':                          return 'tb2';
    case 'CLEVER': case 'BALANCED':
    case 'REFORM': case 'LEVERAGE':
    case 'CONTAIN': case 'DEFLECT':      return 'tc';
    case 'CHAOS':  case 'ATTACK':
    case 'RESIGN':                        return 'tx';
    default:                              return 'ts';
  }
}

export function approvalSvClass(v) {
  if (v < 30) return 'r';
  if (v < 55) return 'a';
  return 'g';
}

export function budgetSvClass(v) {
  if (v < 0)   return 'r';
  if (v < 200) return 'a';
  return 'g';
}

export function trustFillClass(trust) {
  if (trust >= 70) return 'high';
  if (trust >= 40) return 'mid';
  return 'low';
}

export function advisorCardClass(trust, betrayed) {
  if (betrayed || trust < 40) return 'sus';
  if (trust >= 70)            return 'loyal';
  return '';
}

export function trustStatus(trust) {
  if (trust >= 70) return { label: 'LOYAL',     color: 'var(--color-green)' };
  if (trust >= 40) return { label: 'WATCHING',  color: 'var(--color-amber)' };
  return           { label: 'DANGEROUS', color: 'var(--color-red)'   };
}

export function pick(arr) {
  if (!arr?.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

export function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

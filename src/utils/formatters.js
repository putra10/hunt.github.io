// src/utils/formatters.js — Display formatting helpers

export function formatBudget(amount) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}B`;
  return `${sign}${abs}M`;
}

export function formatApproval(value) {
  return `${Math.round(value)}%`;
}

export function formatTrust(value) {
  if (value >= 70) return { label: 'LOYAL',    color: 'var(--color-green)' };
  if (value >= 40) return { label: 'NEUTRAL',  color: 'var(--color-amber)' };
  if (value >= 20) return { label: 'SUSPICIOUS', color: 'var(--color-red)' };
  return             { label: 'HOSTILE',   color: 'var(--color-red)' };
}

export function formatTurn(turn, max = 12) {
  return `Turn ${turn}/${max}`;
}

export function formatDelta(delta, unit = '') {
  const prefix = delta >= 0 ? '+' : '';
  return `${prefix}${delta}${unit}`;
}

export function formatApprovalDelta(delta) {
  return formatDelta(delta, ' approval');
}

export function formatBudgetDelta(delta) {
  return formatDelta(delta, 'M');
}

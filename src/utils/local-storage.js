// src/utils/local-storage.js — Save / load game state

const SAVE_KEY = 'governed_save';
const SAVE_VERSION = '0.1.0';

export function saveGame(state) {
  try {
    const payload = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      data: state.serialize()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('[GOVERNED] Save failed:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.version !== SAVE_VERSION) {
      console.warn('[GOVERNED] Save version mismatch — clearing');
      clearSave();
      return null;
    }
    return payload.data;
  } catch (e) {
    console.warn('[GOVERNED] Load failed:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function getSaveTimestamp() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw).timestamp ?? null;
  } catch {
    return null;
  }
}

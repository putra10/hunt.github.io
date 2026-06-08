// src/utils/random.js — Seeded PRNG for replayability (Mulberry32)

export class SeededRandom {
  constructor(seed) {
    this.seed = seed >>> 0;
  }

  next() {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Integer in [min, max] inclusive
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random element from array
  pick(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[this.int(0, arr.length - 1)];
  }

  // Shuffle array (returns new array, does not mutate)
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Boolean with given probability (0–1)
  chance(probability) {
    return this.next() < probability;
  }
}

// Module-level instance — reseed at game start for replayability
let _rng = new SeededRandom(Date.now());

export function seed(value) {
  _rng = new SeededRandom(value);
}

export function random()            { return _rng.next(); }
export function randomInt(min, max) { return _rng.int(min, max); }
export function randomPick(arr)     { return _rng.pick(arr); }
export function shuffle(arr)        { return _rng.shuffle(arr); }
export function chance(p)           { return _rng.chance(p); }

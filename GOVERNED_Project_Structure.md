# GOVERNED — Project Structure & Mechanics
## Updated: June 2026 (v4.2 — advisor recommendation reasons, "I told you so" reactions, unread message badges)

---

## Folder Structure

```
governed/
├── public/
│   └── index.html              ← Single HTML shell; #app div is the only content
│
├── src/
│   ├── main.js                 ← App class + CITY_REGISTRY (25 cities) + window.GOVERNED
│   │
│   ├── data/
│   │   ├── cities/             ← 25 city JSON data files
│   │   ├── geo/                ← World map TopoJSON (D3 city select map)
│   │   ├── schema.json         ← City content schema reference
│   │   └── voice-bible.md      ← Tone rules per city (for AI city generation)
│   │
│   ├── engine/                 ← Pure game logic — no DOM touches
│   │   ├── game-state.js       ← Single source of truth + serialize/deserialize
│   │   ├── turn-manager.js     ← Turn flow orchestrator + player actions
│   │   ├── crisis-manager.js   ← Crisis pool/trigger (turns 4, 8, 12)
│   │   ├── advisor-system.js   ← Trust, agendas, back channel, lover arc
│   │   ├── consequence-sim.js  ← Decision/crisis outcome applier
│   │   ├── contract-system.js  ← Budget contracts (side quests)
│   │   ├── scandal-system.js   ← 4-tier scandals + responses + exposure
│   │   ├── heat-system.js      ← SCRUTINY: levels, sources, transitions
│   │   ├── market-system.js    ← Black market: selection, effects, risks
│   │   └── generic-problems.js ← Generic decision pool + text interpolation
│   │
│   ├── ui/
│   │   ├── renderer.js         ← Screen router + handlers object
│   │   ├── ui-helpers.js       ← Pure CSS class mapping + text formatting
│   │   ├── components/         ← Reusable HTML-string generators
│   │   └── screens/            ← Full-screen HTML-string generators
│   │
│   ├── utils/
│   │   ├── random.js           ← Seeded PRNG (Mulberry32) — ALL engine RNG goes through it
│   │   ├── validators.js       ← City JSON normalization (incl. scandal tier derivation)
│   │   ├── formatters.js       ← Number/label display helpers
│   │   ├── local-storage.js    ← Save/load game state (key: governed_save)
│   │   ├── settings-store.js   ← Settings persistence independent of saves
│   │   └── career-stats.js     ← Lifetime player stats across games
│   │
│   └── styles/
│       ├── variables.css       ← Design tokens (colors, fonts, spacing)
│       ├── base.css            ← Fluid root font scale + themed scrollbars + reset
│       ├── components.css      ← All card/component styles + mobile dispatch
│       ├── screens.css         ← Screen layouts + END-OF-FILE mobile override block
│       └── animations.css      ← Keyframe animations
│
├── tests/                      ← Vitest suite (npm test)
│   ├── fixtures.js             ← Minimal city fixture + localStorage stub
│   ├── game-state.test.js      ← Save/load round-trip, roster restore regression
│   ├── turn-manager.test.js    ← End conditions, scandal flows, back channel
│   ├── consequence-sim.test.js
│   ├── contract-system.test.js ← Installment math, competing offers
│   └── scandal-system.test.js  ← Authored penalties, reveal queue, responses
│
├── Hardcoded things/           ← Shared content pools
│   ├── budget_corruption.json        }
│   ├── environmental_climate.json    }
│   ├── infrastructure_failure.json   }  6 generic problem categories
│   ├── media_scandal.json            }
│   ├── political_pressure.json       }
│   ├── public_protest.json           }
│   ├── contract_offers.json    ← Contract side-quest pool
│   ├── black_market.json       ← 60 black market offers (6 types × 10)
│   └── advisor_reactions.json  ← Advisor reaction lines ("told_you_so" pool, random pick)
│
├── docs/                       ← Built output for GitHub Pages (DO NOT EDIT)
├── HOW_TO_PLAY.md              ← Full player-facing manual (kept current)
├── IMPROVEMENT_PLAN.md         ← UI ideas, roadmap, ship checklist
├── audit_report.md             ← Mechanics audit history (all findings fixed)
├── CITY_GENERATOR_PROMPT.md    ← Prompt for generating new city JSONs
├── ADVISOR_REASON_PROMPT.md    ← Prompt for generating per-option advisor_reason text
├── package.json                ← scripts: dev / build / preview / test
└── vite.config.js              ← base: '/governed/', outDir: 'docs'
```

---

## Architecture: Data → Engine → UI

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   DATA       │ →  │   ENGINE     │ →  │     UI       │
│  city JSON   │    │  pure logic  │    │  DOM/CSS     │
│  problem &   │    │  no DOM      │    │  read-only   │
│  market pools│    │  state only  │    │  from state  │
└──────────────┘    └──────────────┘    └──────────────┘
```

The engine never touches the DOM. UI never mutates state directly: **button click → `window.GOVERNED.method()` → engine mutates `state` → `app.render()` re-renders from scratch.** All engine randomness routes through the seeded PRNG (`utils/random.js`), so a seed-pinned game replays identically.

---

## Engine Modules

### `game-state.js` — Single source of truth

**Core fields:** `city`, `turn`, `approval`, `budget`, `advisors[]`, `activeCrises[]`, `resolvedCrises[]`, `flags{}`.

**Pending-event queues (all serialized):** `pendingCrisis`, `pendingScandal`, `pendingScandalReveals[]` (surprise-scandal popups), `pendingHeatNotices[]` (SCRUTINY level-up popups), `pendingBetrayals[]`, `pendingBribes[]`, `pendingContractOffers[]`, `pendingUnrest`, `pendingMarketOffers[]`, `pendingLoverDemand`, `pendingPartnerDemand`.

**Problem backlog:** `problemDeadlines{id→turn}`, `lastPresentTurn` (gates ONE new problem/turn — carryover resolutions don't consume it), `ignoredProblems` counter. Unresolved problems carry over between turns; at age ≥ 3 turns `_processOverdueProblems()` closes them as `ignored: true` in `pastDecisions` with a 50/50 outcome: moderate "Governor Sat On It" scandal, or −5% approval + hate comments + reveal popup. **Report gate:** > 1 undecided problem at term end = no invitation regardless of approval.

**SCRUTINY:** `heat` (points), `lastHeatGainTurn`, `siegeTurns`.

**Black market:** `purchasedOffers[]` (once-per-game tracking), `marketEffects{}` (every active aura/shield/stream — see market-system).

**Bookkeeping:** `backChannelUsedTurn` (one dirty action per turn), `dirtyDeeds{skimmed, threats, leaks, exposed, marketBuys}`, `endReason` (`recalled | term_complete | career_ending_scandal | resigned`), `consecutiveDeficitTurns`.

**Per-advisor runtime fields:** `trust`, `agendaProgress`, `betrayed`, `sacrificed`, `romanceExposed`, `relationshipType`, `scorned`, `lastDemandTurn`, `emergencyPowerUsed`, `corruptPact`, `pactTurns` (cumulative — never resets on restart), `totalSkimmed`, `pactResidual`, `threatCount`, `leakUsed`, `pendingReaction` (queued "told you so" — `{type, title, turn}`), `pendingReactionMsg` (ready-to-read chat line; drives the unread badge until the messenger consumes it).

**`deserialize()`** rebuilds the advisor roster **from the save**, not from `loadCity()`'s shuffle (regression-tested — loading used to reshuffle advisors).

### `turn-manager.js` — Turn flow + player actions

**`processTurn()` sequence:**
```
0.   Auto-fire unhandled pendingScandal (full penalty)
0.5  _processHeatAndMarket():
       market offers expire · heat decay (−1 per clean turn)
       siege clock (3 turns UNDER SIEGE = recall)
       impeachment flag → major scandal
       fixer resurface · income streams · approval drips
       pension loan due · forced unrest (arms sale)
1.   tickAgendas (agenda +5*, trust −2; betray at 80)   *frozen by market FX
2.   tickRelationships (rel modifiers, romance roll, scorned, lover demands)
3.   processCorruptPacts (skim, +2 trust, discovery roll 5%+1%/turn)
4.   generateBribeOffers (agenda ≥ 60, 30%)
5.   pendingCrisis → activeCrises
6.   _checkEndConditions (approval 0 / siege / turn ≥ 12 & no crisis / 3 failed crises)
7.   turn++ · decision quota reset
8.   Economy: passive tax → budget pressure (slush fund, deficit pause)
        → tier drain (truce pause, halved drains)
9.   _rollScandalEvent (settings freq × military passive × SCRUTINY mult
        × market dampers; newsroom-bug skip; lover tip-off 35%)
10.  _rollUnrestEvent (budget<0 & approval<37; immunity/damp/boost FX)
11.  Contracts: installments (+ remainder on final) → offer roll
12.  Reactions ("I told you so" delivery) → briefings → recommendations → absence effects
13.  Crisis trigger on 4/8/12 (skip-crisis FX consumes the window)
14.  saveGame
```

**Player actions:** `resolveDecision` (applies halve-next-loss FX, rec trust ±, queues a told-you-so reaction when ignored advice goes badly, domain trust +5/agenda −8, then **rolls the black market**), `resolveCrisis` (crisis cost/approval FX), `resolveUnrest`, `acceptScandal/suppressScandal/respondToScandal`, `accept/declineBribe`, contracts, `useEmergencyPower`, `backChannelAction`, `buyMarketOffer/passMarket`, `addressNation`, `resolveLoverDemand`.

### `heat-system.js` — SCRUTINY

Points internal, levels public: QUIET 0 · MURMURS 10 · WATCHED 25 · INVESTIGATED 45 · UNDER SIEGE 70. Scandal heat: minor +1, moderate +2, major +3, career +5. `addHeat()` queues level-transition notices and entry effects (audit −20M at INVESTIGATED, impeachment at SIEGE). `scandalChanceMult()`: ×1 / ×1 / ×1.25 / ×1.5 / ×2. Defuses: clean-turn decay, Address the Nation (once per term, heat ≥ 25), sacrifice (back channel), market laundry offers.

### `market-system.js` — Black market

Pool: `Hardcoded things/black_market.json`, 6 types × 10 offers. **`rollOffers(domain)`** fires after the day's decision: 30% base +10% deficit +10% approval<35 (cap 50%). One offer from a random type + one *linked* offer (problem domain → dealer type: finance→sellside, urban/transport→insurance, religious→intelligence, military→influence, media→cleanup). Offers expire at next `processTurn`. INVESTIGATED+ adds 25% price premium. **`buy()`** applies cost, effects (interpreter with ~30 ops: stat deltas, advisor ops, clears, timed auras, shields, income streams, the pension loan), heat, then rolls the risk (scandal / resurface-worse / rivalry / forced unrest). Everything lands in `state.marketEffects` and is consumed by the relevant engine hook.

### `advisor-system.js` — Advisors, back channel, lover arc

**`BACK_CHANNEL_ACTIONS`** (one per turn; conditions on trust/approval/budget/agenda/heat):
get_closer · keep_distance · corrupt_pact (trust ≥ 60, budget < 150) · end_pact · threaten (agenda ≥ 40 or PI-unlock, approval ≥ 45; backfire scales with leverage, doubles on reuse, 3rd = instant betrayal) · leak (agenda ≥ 50, 30M, once per advisor) · **sacrifice** (heat ≥ 20: heat −10, +2% approval, cabinet −8 trust; lover variant −12/−4%/−12).

**Lover arc:** one lover only (cheating → scorned ex, may go public at +1 severity for 2 turns; breakups same). Devoted lover (trust ≥ 70): 35% tip-off cancels a rolled scandal. **Demands: 40%/turn** (`pendingLoverDemand`, max one pending): fund −30M or pardon +1 heat; refusal cools the relationship. Exposure stance by trust: ≥ 70 penalty halved +10 trust; < 40 full penalty + rivalry.

**Partner demands:** active corrupt pact partner demands an answer **40%/turn** (`pendingPartnerDemand`): `bigger_cut` (pay −25M/+5 trust, or refuse → pactTurns +1, trust −8) or `cold_feet` (accept → `pactPaused`: next turn no skim/no risk; refuse → pactTurns +1, trust −5). Resolved via `resolvePartnerDemand(accept)`.

**Unread badges:** advisor cards show a pulsing red badge — "needs an answer" when that advisor's lover/partner demand is pending, "new message" when a told-you-so reaction waits unread; the mobile ADVISORS tab gets a red dot when any demand, bribe, or unread reaction waits.

**Recommendations are personality-driven**, not safety-driven: per-advisor weights (finance=budget, military=anti-scandal, urban=approval...), self-interest from `advisor_effects`, ±noise — and at agenda ≥ 60 a **50% chance of deliberate sabotage** (approval term inverted). Console logs `(SCHEMING)`. In the messenger the rec renders as a **chat bubble** with the option's authored `advisor_reason` — the advisor makes their case before naming their pick.

**Reactions ("I told you so"):** when the player **ignores a recommendation** and the chosen option's `approval_delta` is negative AND worse than the recommended option's, `resolveDecision` queues `advisor.pendingReaction`. Next `processTurn`, `deliverPendingReactions()` converts it to `pendingReactionMsg` — a random line from `Hardcoded things/advisor_reactions.json` (`told_you_so` pool, `{title}` interpolated). Opening that advisor's messenger pushes it into the chat log and clears the badge. The file is extensible: add new pools keyed by reaction type.

**Pacts:** skim = max(10, 25% of tax rate)/turn, +2 trust (complicity), discovery 5% +1%/turn; exposure severity by cumulative `pactTurns` (≤2 minor → 9+ career_ending); residual 4% × 2 turns after ending.

### `scandal-system.js`

4 tiers (−5/−12/−22/−40 default; **city-authored `approval_penalty` takes precedence**). `safeTier()` guards bad JSON. `_applyScandal()` adds heat + queues a reveal popup for every *surprise* scandal (sourceId ≠ 'accepted') with a human explanation of the source. Pending-card paths: suppress (20/40/80/150M) / accept / **manage the story** (tier responses; base penalty applies first, response shapes it). Career-ending: resign (game over) or Desperate Last Stand (150M, 25% — survival still applies the scandal penalty). `triggerRomanceExposure(name, severityBoost)` handles stance variants and the Deepfake Insurance shield.

### `crisis-manager.js` / `consequence-sim.js` / `contract-system.js` / `generic-problems.js`

Largely as before: crisis windows 4/8/12 with turn-12 fallback; consequence applier (positive trust_delta counters agenda ×1.5, scandal_risk roll, crisis/decision unlocks); contracts (tier chance + deficit bonus, installments **pay the rounding remainder on the final payment**, accepting one competing offer marks the other declined); generic problems (domain-tagged pools, `{city.*}` interpolation — including per-option `advisor_reason`, trust < 30 hides the domain's problems). Scandal responses now report `hitZero`: if the base penalty zeroes approval, the recall fires even when the response's recovery modifier would lift it back above 0. Problem options carry an optional `advisor_reason` (the advisor's authored argument for that option — generate with `ADVISOR_REASON_PROMPT.md`).

---

## UI

**`renderer.js`** — router; `handlers` object delegates everything to `window.GOVERNED`.

**`dispatch-screen.js`** — main game screen (grid `30% 1fr 20%`). Story column: pips, story card, **black market card** (after the day's decision, when open). Decision column: decision cards, **Address the Nation card** (heat ≥ 25, once), scandal card (with manage-the-story responses), unrest card, END TURN (sticky on desktop). Right: advisor cards (badges: BETRAYED / PLOTTING / OFFERING A DEAL (real offers only) / CHECKED OUT / GROWING RESTLESS), bribe + contract cards, crisis window (synced to engine's 4/8/12), live ticker. Full-screen popup queues: **heat notices → scandal reveals → betrayals** (sacrifice variant labeled SACRIFICED).

**`messenger-screen.js`** — advisor chat: quick replies, **recommendation chat bubble** (authored `advisor_reason` + pick + trust note), delivered **"I told you so" messages** (consumed from `pendingReactionMsg` on open), emergency power, **lover demand box**, **BACK CHANNEL section** (only actions whose triggers pass; pact status line with live risk; one-per-turn notice).

**`settings-screen.js`** — tabs: Gameplay (scandal freq — wired to engine; language placeholder), Display (feed speed — wired), Audio (sound toggle — persists, no audio engine yet), Stats (**CAREER** lifetime stats + CURRENT SESSION), Data (**Resign Early** during a game + Reset Save). All changes persist via `settings-store.js` immediately (independent of game saves).

**`report-screen.js`** — endings: term complete / RECALLED / RESIGNED (scandal: "resigned in disgrace" or "the last stand failed") / RESIGNED (voluntary). Crises survived counted **out of 3** (windows, not city crisis count). Boxes: worst decision, **DIRTY HANDS / CLEAN HANDS**, **BACKROOM RELATIONS** (per-advisor epitaphs: lover, pact partner + skim total, threats, leaks, sacrificed...).

**`menu-screen.js`** — PLAY / SETTINGS, HOW TO PLAY modal (current systems), formal CREDITS modal.

**`cityselect-screen.js`** — D3 world map, 25 pins + planned-city dots, terminal-style posting board.

**`top-bar.js`** — city/turn/approval/budget + **SCRUTINY level with pips** (hidden while QUIET).

---

## Styles — important rules

- **`base.css`** — fluid root font: `clamp(14px, 100vw/60, 64px)` — whole UI (rem-based) keeps the same proportions at any desktop width. Tablet 150% / phone 125% fixed. **Themed scrollbars globally** (6px dark thumb).
- **`screens.css`** — ⚠ has a mobile media block near the TOP that **loses the cascade** to desktop rules below it. The authoritative mobile overrides live in the **"MOBILE STICKY FIX" block at the END of the file** (settings tab strip, messenger grid, main-body). Add new mobile overrides THERE.
- **`components.css`** — desktop: `.story` scrolls, `.dec` capped at 72% with internal scroll + sticky END TURN. Mobile: `.dec` flows normally (sticky removed — taller-than-viewport sticky panels bury the story).

---

## City JSON Schema (key fields)

As before (city_id, tier, tax_rate, advisors, decisions, crises, scandals, comment_library, scandal_reactions, romance_exposure), plus:

```json
"advisors": [
  {
    "id": "finance_Jane",
    "domain_id": "finance",       ← New: explicitly defines the advisor's domain
    "name": "Jane Doe",
    "role": "Director of Budget",
    "portrait": "📋",
    "agenda": "Maintain fiscal solvency...",
    "dialogue": { ... }
  }
],
"scandals": [
  { "id": "...", "title": "...", "description": "...",
    "approval_penalty": -14,
    "severity_tier": "moderate"   ← optional; derived from penalty if absent
  }                                  (≤−30 career, ≤−18 major, ≤−8 moderate)
],
"address_the_nation": {            ← optional; generic fallback exists
  "title": "Steps of Balai Kota",
  "body": "Two hundred journalists. One podium...",
  "option_flavor": { "own_it": "...", "defiant": "...", "deflect": "..." }
}
```

---

## Economy Reference

`income/turn = round(taxRate × approval/100)` · tier defaults 80/60/40/25/15 (city `tax_rate` overrides). Deficit: −3%/turn (−5% below −200M). Corrupt pact skim: max(10, 25% of tax rate). Black market prices 20–150M (+25% at INVESTIGATED). Suppress costs 20/40/80/150M.

---

## Public API (window.GOVERNED)

```javascript
goToMenu(), goToCitySelect(), goToSettings(),
startGame(cityKey, governorName),          // async
switchCity(cityId),                        // async
nextTurn(),
handleDecision(decisionId, optionIndex),
handleCrisisDecision(crisisId, optionIndex, advisorSecretId?),
acceptScandal(), suppressScandal(), respondToScandal(responseId),
openMessenger(advisorId), backToDispatch(),
dismissBetrayal(), dismissScandalReveal(), dismissHeatNotice(),
acceptBribe(id), declineBribe(id),
acceptContract(id), declineContract(id), declineAllContracts(),
resolveUnrest(action), useEmergencyPower(id),
shiftAdvisorRelationship(id, delta),
backChannelAction(advisorId, actionId),    // get_closer/keep_distance/corrupt_pact/
                                           // end_pact/threaten/leak/sacrifice
buyMarketOffer(offerId), passMarket(),
addressNation(optionId),                   // own_it/defiant/deflect
loverDemand(accept), partnerDemand(accept),
resignEarly()
```

All game-over paths route through `app._endGame()` → records career stats exactly once (`career_recorded` flag).

---

## Persistence

| Key | Contents |
|---|---|
| `governed_save` | Full game state (versioned 0.1.0; mismatch clears) |
| `governed_settings` | Settings — written on every change, loaded at boot |
| `governed_career_stats` | Lifetime: games, terms completed, recalls, resignations, best approval, turns governed |

---

## Adding New Cities

1. Generate JSON with `CITY_GENERATOR_PROMPT.md`
2. Ensure plain object (not array-wrapped); include `scandal_reactions`, `romance_exposure`, ideally `address_the_nation`
3. Drop in `src/data/cities/`, register in `CITY_REGISTRY` (main.js), pin in `CITIES` (cityselect-screen.js)

---

## Build, Test & Deploy

```bash
npm run dev       # Dev server (localhost:4444 as configured)
npm test          # Vitest engine suite
npm run build     # Build to docs/
```

GitHub Pages serves `docs/` at `https://putra10.github.io/governed/` (`base: '/governed/'`).

---

*Updated by Claude — June 2026*

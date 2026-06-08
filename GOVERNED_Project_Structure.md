# GOVERNED — Project Structure
## Updated: June 2026 (post v3 advisor & unrest expansion)

---

## Folder Structure (Current)

```
governed/
├── public/
│   ├── index.html              ← Single entry point
│   └── assets/
│       ├── fonts/
│       └── icons/
│
├── src/
│   ├── main.js                 ← App class, CITY_REGISTRY (20 cities), public API
│   ├── data/
│   │   ├── cities/             ← 20 city JSONs
│   │   │   ├── jakarta.json    ← Easy reference / gold standard
│   │   │   ├── singapore.json
│   │   │   ├── sf.json
│   │   │   ├── shenzhen.json
│   │   │   ├── brisbane.json   ← NEW (easy)
│   │   │   ├── lagos.json
│   │   │   ├── frankfurt.json
│   │   │   ├── jeddah.json
│   │   │   ├── beijing.json
│   │   │   ├── nyc.json
│   │   │   ├── toronto.json
│   │   │   ├── johannesburg.json ← NEW (medium)
│   │   │   ├── karachi.json    ← NEW (hard)
│   │   │   ├── cayman.json     ← NEW (hard, special: 3 advisors, high tax_rate)
│   │   │   ├── tehran.json
│   │   │   ├── tel-aviv.json
│   │   │   ├── crimea.json
│   │   │   ├── gaza.json
│   │   │   ├── caracas.json
│   │   │   └── mogadishu.json  ← NEW (extreme)
│   │   ├── schema.json         ← City content schema
│   │   └── voice-bible.md      ← Tone rules per city
│   │
│   ├── engine/
│   │   ├── game-state.js       ← Single source of truth
│   │   │                         State fields: city, turn, approval, budget,
│   │   │                         activeCrises, resolvedCrises, pendingCrisis,
│   │   │                         advisors[], pastDecisions, pastCrises,
│   │   │                         activeScandals, resolvedScandals, pendingScandal,
│   │   │                         pendingBribes[], pendingBetrayals[],
│   │   │                         presentedDecisions[], flags{},
│   │   │                         decisionsThisTurn, maxDecisionsThisTurn,
│   │   │                         consecutiveDeficitTurns (budget streak counter),
│   │   │                         pendingUnrest (null | { type, turn }),
│   │   │                         pendingDecisionRecommendations (advisorId→optionIndex),
│   │   │                         settings{ tutorial, sound, feedSpeed, scandalFreq }
│   │   │                         Advisor runtime: trust, agendaProgress,
│   │   │                         betrayed, romanceExposed, relationshipType,
│   │   │                         emergencyPowerUsed (bool, once per game)
│   │   │                         Dynamic advisor count (GDD §4.1):
│   │   │                           easy/medium=5, hard=4, extreme/war=3
│   │   │                           city.advisor_count overrides (e.g. Cayman=3)
│   │   │                           Randomly shuffled from full JSON pool each game
│   │   │
│   │   ├── turn-manager.js     ← Turn flow controller
│   │   │                         processTurn(): auto-fire unhandled scandal,
│   │   │                         tick agendas, tick relationships, bribe offers,
│   │   │                         crisis queue, end check, increment turn,
│   │   │                         passive tax, budget pressure, scandal roll,
│   │   │                         unrest roll, advisor briefings + recommendations,
│   │   │                         absence effects, crisis trigger
│   │   │                         Scandal roll uses settings.scandalFreq:
│   │   │                           low=8%, normal=20%, high=38%
│   │   │                         _applyBudgetPressure(): tracks consecutiveDeficitTurns
│   │   │                           reset to 0 when budget ≥ 0
│   │   │                         _rollUnrestEvent(): budget<0 AND approval<37, turn≥3
│   │   │                           chance = 0.20 + debtPressure*0.15 + approvalPanic*0.20
│   │   │                           type: approval<18→riot, <28→demonstration, else strike
│   │   │                           urban_planning trust≥75 reduces chance by 20%
│   │   │                         resolveUnrest(action): 6 actions
│   │   │                           meet_demands(−20M), stand_firm(−5ap),
│   │   │                           engage(−25M +2ap), disperse(−10ap),
│   │   │                           negotiate(−40M), crackdown(−18ap +30% scandal)
│   │   │                         useEmergencyPower(advisorId): condition-gated,
│   │   │                           one-time per advisor, −8 trust on use
│   │   │                         resolveCrisis(id, optIdx, advisorSecretId?):
│   │   │                           virtual secret option via ADVISOR_SECRET_CRISIS_OPTIONS
│   │   │                         resolveDecision(): applies recommendation trust deltas
│   │   │                           (+3 trust if followed, −2 if ignored) before domain bonus
│   │   │                         Trust-gated passives:
│   │   │                           finance trust≥75 → +10M/turn (_applyPassiveTax)
│   │   │                           military_liaison trust≥75 → ×0.85 scandal chance
│   │   │                           urban_planning trust≥75 → ×0.80 unrest chance
│   │   │
│   │   ├── crisis-manager.js   ← Crisis pool selection, escalation
│   │   │
│   │   ├── advisor-system.js   ← All 4 advisor layers + new systems
│   │   │                         L1: trust −2/turn, domain recovery +5 trust −8 agenda
│   │   │                         L2: trust<30 → domain hidden + budget/approval penalty
│   │   │                         L3: positive trust_delta → agendaProgress×1.5 reduction
│   │   │                         Personal: neutral→trust→romantic (extra loyalty,
│   │   │                           +4 trust/turn, 5% romance exposure risk/turn)
│   │   │                           rivalry (−4 trust/turn, accelerated agenda)
│   │   │                         generateBribeOffers(): agenda≥60 → 30% chance
│   │   │                         applyAbsenceEffects(): finance−5M, others −1 approval
│   │   │                         generateRecommendations(decision): domain-matched
│   │   │                           advisor picks highest approval_delta option,
│   │   │                           stores in pendingDecisionRecommendations
│   │   │                         generateBriefings(): trust>70 → intel line instead
│   │   │                           of normal briefing line (_generateIntel):
│   │   │                             finance: deficit forecast / streak warning
│   │   │                             military_liaison: crisis window / active unrest
│   │   │                             urban_planning: approval near unrest threshold
│   │   │                         EMERGENCY_POWERS export (5 advisors, one-time):
│   │   │                           finance: EMERGENCY LOAN (+80M −5ap, budget<−50)
│   │   │                           military_liaison: MARSHAL FORCES (clears unrest)
│   │   │                           urban_planning: COMMUNITY INITIATIVE (+10ap −20M)
│   │   │                           religious_affairs: UNITY SERMON (+7ap)
│   │   │                           transport: EMERGENCY RELIEF ROUTES (+15M −3ap)
│   │   │                           All require trust≥45 (military_liaison: ≥50)
│   │   │                         ADVISOR_SECRET_CRISIS_OPTIONS export (5 advisors):
│   │   │                           engine-side consequence data for crisis virtual index
│   │   │
│   │   ├── contract-system.js  ← Side-quest / budget relief contracts
│   │   │                         TIER_CHANCE: easy=0.40, medium=0.35, hard=0.30,
│   │   │                           extreme=0.25, war=0.20 base roll chance
│   │   │                         rollContractOffer(): adds deficitBonus +0.20 when
│   │   │                           consecutiveDeficitTurns ≥ 2 (cap 0.70 total)
│   │   │                         Competing offers: choose 1 of 2 presented
│   │   │                         Installment contracts: pay in stages over turns
│   │   │                         acceptContract / declineContract / declineAllContracts
│   │   │
│   │   ├── consequence-sim.js  ← Resolves decision/crisis outcomes
│   │   │
│   │   ├── generic-problems.js ← Generic decision pool (non-crisis turns)
│   │   │
│   │   └── scandal-system.js   ← GDD §3.5 scandal engine
│   │                             SCANDAL_SEVERITY: 4 tiers with labels/penalties/responses
│   │                             City reactions read from city.scandal_reactions[tier]
│   │                             FALLBACK_REACTIONS used when city JSON lacks field
│   │                             Romance exposure reads city.romance_exposure
│   │                             (severity + flavour text, no hardcoded culture map)
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── top-bar.js
│   │   │   ├── public-feed.js      ← 50+ entries, speed from settings.feedSpeed
│   │   │   ├── story-card.js
│   │   │   ├── decision-cards.js
│   │   │   ├── advisor-card.js
│   │   │   └── report-card.js
│   │   │
│   │   ├── screens/
│   │   │   ├── dispatch-screen.js  ← Main game view
│   │   │   │                         Betrayal overlay (position:fixed, z-index:999)
│   │   │   │                           renders pendingBetrayals[] one-at-a-time
│   │   │   │                           [data-dismiss-betrayal] → handlers.dismissBetrayal()
│   │   │   │                         Feed speed: animation-duration from settings.feedSpeed
│   │   │   │                           slow=120s, normal=75s, fast=35s
│   │   │   │                         Bribe cards, scandal cards, advisor cards,
│   │   │   │                         contract cards (accept/decline/decline-all)
│   │   │   │                         renderUnrestCard(unrest): .unrest-card
│   │   │   │                           type-specific icon + action buttons
│   │   │   │                           [data-resolve-unrest] → handlers.resolveUnrest()
│   │   │   │                           strike: meet_demands / stand_firm / engage
│   │   │   │                           demonstration: disperse / negotiate / engage
│   │   │   │                           riot: crackdown / negotiate / meet_demands
│   │   │   ├── cityselect-screen.js ← SVG world map, 20 city pins
│   │   │   │                          Tier colors:
│   │   │   │                            easy=#5ca85c, medium=#d4a843, hard=#e07a30
│   │   │   │                            extreme=#cc44cc, war=#cc2222
│   │   │   ├── settings-screen.js  ← Tabbed UI using st-* CSS classes
│   │   │   │                          Tabs: Gameplay, Display, Audio, Data
│   │   │   │                          Gameplay: tutorial toggle, scandal frequency
│   │   │   │                          Display: feed speed (slow/normal/fast)
│   │   │   │                          Audio: sound toggle
│   │   │   │                          Data: live stats, reset save button
│   │   │   │                          settings persist across city changes (not reset on loadCity)
│   │   │   │   ├── messenger-screen.js ← Advisor chat view
│   │   │   │                         _renderRecommendation(state, advisor):
│   │   │   │                           .adv-rec box if advisor has recommendation
│   │   │   │                           for current pending decision
│   │   │   │                         _renderEmergencyPower(state, advisor):
│   │   │   │                           .adv-ep box with ACTIVATE button
│   │   │   │                           if condition met and power not used
│   │   │   │                           [data-use-emergency] → handlers.useEmergencyPower()
│   │   │   ├── crisis-screen.js    ← Crisis resolution view
│   │   │   │                         ADVISOR_SECRET_OPTIONS local const (display data):
│   │   │   │                           label, advisorNote, consequences per advisor
│   │   │   │                         Most-trusted advisor trust≥60 → .cc-secret card
│   │   │   │                           at virtual index = crisis.options.length
│   │   │   │                           [data-advisor-secret] passes advisorId
│   │   │   ├── menu-screen.js      ← HOW TO PLAY + CREDITS modals
│   │   │   └── report-screen.js
│   │   │
│   │   └── renderer.js             ← Screen router + all action handlers
│   │                                 resolveUnrest(action) → window.GOVERNED?.resolveUnrest()
│   │                                 useEmergencyPower(id) → window.GOVERNED?.useEmergencyPower()
│   │                                 handleCrisisDecision passes advisorSecretId (3rd arg)
│   │
│   ├── utils/
│   │   ├── random.js
│   │   ├── validators.js       ← normalizeCity(), loadCity(), validateCity()
│   │   ├── formatters.js
│   │   └── local-storage.js
│   │
│   └── styles/
│       ├── variables.css
│       ├── base.css
│       ├── components.css      ← All card/component styles
│       │                         Unrest: .unrest-card, .unrest-card--{riot,demo,strike}
│       │                           .uc-header, .uc-icon, .uc-title, .uc-desc
│       │                           .uc-actions, .uc-btn, .uc-note
│       │                           .uc-costly, .uc-hard, .uc-danger (cost markers)
│       │                         Advisor recommendation: .adv-rec, .adv-rec-header,
│       │                           .adv-rec-body, .adv-rec-note
│       │                         Emergency power: .adv-ep, .adv-ep-header,
│       │                           .adv-ep-desc, .adv-ep-note, .adv-ep-btn, .adv-ep-warn
│       │                         Crisis secret: .cc-secret, .cc-tag-advisor,
│       │                           .cc-secret-advisor, .cc-secret-note
│       ├── screens.css         ← Betrayal overlay (.betrayal-overlay, .betrayal-modal)
│       │                         Settings tabs (.st-screen, .st-sidenav, .st-section)
│       │                         Bribe cards (.bribe-card), scandal cards (.scandal-card)
│       └── animations.css
│
├── HOW_TO_PLAY.md              ← Full player guide (all mechanics)
├── CITY_GENERATOR_PROMPT.md    ← Gemini prompt for generating new city JSONs
├── package.json
└── vite.config.js
```

---

## Data → Engine → UI Rule

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DATA      │ →  │   ENGINE    │ →  │     UI      │
│  (JSON)     │    │  (JS logic) │    │  (DOM/CSS)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## City JSON Schema (key fields)

```json
{
  "city_id":        "string (snake_case)",
  "city_name":      "string",
  "tier":           "easy | medium | hard | extreme | war",
  "tax_rate":       "integer (optional — overrides tier default income per turn)",
  "advisor_count":  "integer (optional — overrides tier default advisor count)",
  "problem_clusters": ["string", "string", "string"],
  "city_personality": { "voice", "humor_style", "media_outlet", "landmark", ... },
  "opening_sequence": {
    "title": "string",
    "intro": "string",
    "starting_stats": {
      "approval_rating": 40-60,
      "budget": 200-800,
      "advisor_trust_levels": { "finance": 50, "military_liaison": 50, ... }
    }
  },
  "advisors": [ /* exactly 5 in JSON; game picks subset by advisor_count */ ],
  "decisions":  [ /* 5 city-specific policy decisions */ ],
  "crises":     [ /* 4 crises, turn_min/turn_max staggered */ ],
  "scandals":   [ /* 3 scandals with severity_tier */ ],
  "comment_library": {
    "positive": [], "neutral": [], "negative": [],
    "media": [], "politician": [], "activist": [],
    "street": [], "crisis": [], "scandal": []
  },
  "scandal_reactions": {
    "minor": "string",
    "moderate": "string",
    "major": "string",
    "career_ending": "string"
  },
  "romance_exposure": {
    "severity": "minor | moderate | major | career_ending",
    "flavour": "string"
  }
}
```

---

## Economy System

Each turn, in order:
1. **Passive Tax**: `income = round(taxRate × approval/100)`
   - Tier defaults: easy=80, medium=60, hard=40, extreme=25, war=15
   - `city.tax_rate` overrides (e.g. Cayman=160 offshore hub, Gaza=35 international aid)
2. **Budget Pressure**: budget < 0 → −3 approval/turn; budget < −200 → −5 approval/turn
3. **Scandal Roll**: chance set by `settings.scandalFreq` (low=8%, normal=20%, high=38%)

---

## Advisor System (GDD §4.1–4.3)

**Count by city type:**
| City type | Count | Example |
|-----------|-------|---------|
| easy/medium (major city) | 5 | Jakarta, NYC |
| hard | 4 | Karachi |
| extreme/war (war zone) | 3 | Gaza, Tehran |
| Special | 3 | Cayman (via `advisor_count: 3`) |

JSON always has 5 advisors; game shuffles and picks the required count at `loadCity()`.

**Layers:**
| Layer | What it does |
|-------|-------------|
| L1: Trust decay | −2/turn; domain decision → +5 trust, −8 agenda |
| L2: Domain gate | trust<30 → domain hidden; budget/approval penalty |
| L3: Betrayal slow | trust_delta>0 → also cuts agendaProgress×1.5 |
| Personal | neutral→trust→romantic; rivalry track |

**Relationship types:**
- `neutral`: no modifier
- `trust`: +2 trust/turn
- `rivalry`: −4 trust/turn, agenda accelerates
- `romantic`: +4 trust/turn, 5% romance exposure risk/turn

Betrayals queue in `pendingBetrayals[]` and display as a full-screen blocking overlay in dispatch-screen.js — one at a time, dismissed via ACKNOWLEDGE button.

---

## Scandal Severity Tiers (GDD §3.5)

| Tier | Approval | Suppress Cost | Responses |
|------|----------|--------------|-----------|
| minor | −5 | 20M | Deny / Deflect / Blame Staff |
| moderate | −12 | 40M | Apologize / Fire Advisor / Investigate |
| major | −22 | 80M | Resign Offer / Fight Legal / Coalition |
| career_ending | −40 | 150M | Desperate Last Stand (25% miracle) / Resign |

City reactions: read from `city.scandal_reactions[tier]`. Falls back to `FALLBACK_REACTIONS` in scandal-system.js if not set. `ROMANCE_EXPOSURE_CULTURE` map has been removed — severity is now per-city in `city.romance_exposure`.

---

## Settings System

Stored in `state.settings` — persists across city changes (not reset by `loadCity()`). Serialized/deserialized with save data.

| Setting | Values | Effect |
|---------|--------|--------|
| `tutorial` | true/false | Show advisor briefing tips |
| `sound` | true/false | Audio feedback |
| `feedSpeed` | slow/normal/fast | Feed scroll: 120s/75s/35s (inline CSS) |
| `scandalFreq` | low/normal/high | Scandal roll: 8%/20%/38% per turn |

---

## Turn Flow

```
processTurn()
  0. Auto-fire unhandled pendingScandal
  1. tickAgendas()        — agenda +5/turn, trust −2/turn, betrayal at 80 → pendingBetrayals[]
  2. tickRelationships()  — relationship modifiers, romance exposure roll
  3. generateBribeOffers()— agenda≥60, 30% chance per advisor
  4. Push pendingCrisis if queued
  5. _checkEndConditions()— approval≤0, turn≥12, 3 failed crises
  6. turn++
  7. _applyPassiveTax()   — reads city.tax_rate or tier default
  8. _applyBudgetPressure()
  9. _rollScandalEvent()  — chance from settings.scandalFreq
  10. generateBriefings()
  11. applyAbsenceEffects()
  12. shouldTriggerCrisis() → crisis_triggered on turns 4/8/12
```

---

## Public API (window.GOVERNED)

```javascript
window.GOVERNED = {
  nextTurn(),
  handleDecision(decisionId, optionIndex),
  handleCrisisDecision(crisisId, optionIndex),
  openMessenger(advisorId),
  backToDispatch(),
  dismissBetrayal(),              // clears first item in pendingBetrayals[], re-renders
  acceptScandal(),
  suppressScandal(),
  respondToScandal(responseId),
  acceptBribe(advisorId),
  declineBribe(advisorId),
  shiftAdvisorRelationship(advisorId, delta),
  goToMenu(), goToCitySelect(), goToSettings(),
  switchCity(cityId),
}
```

---

## Adding New Cities

1. Generate JSON with `CITY_GENERATOR_PROMPT.md` (Gemini)
2. Ensure JSON is a plain object (not array-wrapped)
3. Verify `scandal_reactions` and `romance_exposure` fields exist
4. Drop file in `src/data/cities/`
5. Add entry to `CITY_REGISTRY` in `main.js`
6. Add pin to `CITIES` array in `cityselect-screen.js` (tier color, cx/cy coordinates, flavor)

---

*Updated by Claude — June 2026*

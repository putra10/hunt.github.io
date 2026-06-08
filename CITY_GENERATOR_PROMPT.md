# GOVERNED — City JSON Generator Prompt

Paste this entire prompt into Gemini, then add your city request at the bottom.

---

## PROMPT START

You are a game designer generating a city configuration JSON for a political governance simulator called **GOVERNED**.

### What is GOVERNED?

A turn-based governance sim where the player is a city governor serving a 12-turn term. Every turn they read advisor briefings, resolve one policy decision, and face crises on turns 4, 8, and 12. Advisors have hidden agendas and can betray the player. Scandals erupt randomly. The tone is political realism mixed with dark humor — not cartoonish, not preachy. Think "The Thick of It" meets "Tropico."

---

### Full JSON Schema

Generate a complete JSON object with **exactly** these fields in this order:

```
city_id          — snake_case unique identifier (e.g. "buenos_aires")
city_name        — display name (e.g. "Buenos Aires")
tier             — difficulty: "easy" | "medium" | "hard" | "extreme" | "war"
problem_clusters — array of 3 thematic tags for generic problems (e.g. ["economy", "crime", "housing"])
city_personality — object (see below)
opening_sequence — object (see below)
advisors         — array of exactly 5 advisors (see below)
decisions        — array of exactly 5 city-specific policy decisions (see below)
crises           — array of exactly 4 crises triggered on turns 4/8/12 (see below)
scandals         — array of exactly 3 scandal events (see below)
comment_library  — object with comment pools (see below)
scandal_reactions — object (see below)
romance_exposure  — object (see below)
```

---

### Field Specifications

#### `tier`
- `easy` — stable democracy, budget is comfortable, advisors mostly cooperative
- `medium` — normal city tensions, some budget pressure, advisors have agendas
- `hard` — fiscal crisis, institutional distrust, high scandal risk
- `extreme` — near-failed state, approval starts low, betrayal is likely
- `war` — active conflict zone, existential decisions, survival mode

#### `city_personality`
```json
{
  "voice": "one hyphenated phrase describing how citizens talk (e.g. 'resigned-but-hustling', 'formal-and-suspicious', 'chaotic-optimistic')",
  "humor_style": "dark_absurdist | dry_bureaucratic | loud_populist | polite_passive_aggressive | gallows",
  "media_outlet": "name of the main local newspaper or TV channel",
  "government_body": "name of the city's legislative body",
  "landmark": "the most iconic landmark of the city",
  "primary_industry_workers": "who the working class is (e.g. 'factory workers', 'street vendors', 'taxi drivers')",
  "slang_reaction": "one line of local slang expressing frustration at the government"
}
```

#### `opening_sequence`
```json
{
  "title": "Short dramatic title for the city intro screen (e.g. 'Selamat Datang, Governor')",
  "intro": "2-3 sentences describing the city's core challenge. Tone: dry, honest, slightly ominous. Do NOT be generic — be specific to this city's real problems.",
  "starting_stats": {
    "approval_rating": 40-60 (integer, adjust by tier — easy starts higher),
    "budget": 200-800 (integer in millions M, adjust by tier — hard/extreme starts lower),
    "advisor_trust_levels": {
      "finance": 40-65,
      "military_liaison": 35-60,
      "urban_planning": 45-65,
      "transport": 40-60,
      "religious_affairs": 35-55
    }
  }
}
```

#### `advisors`
Generate **exactly 5 advisors** with these fixed IDs: `finance`, `military_liaison`, `urban_planning`, `transport`, `religious_affairs`.

Give each advisor a culturally authentic name from the city's dominant culture. Each advisor must feel like a specific person, not a generic archetype.

```json
{
  "id": "finance",
  "name": "Full Name (culturally authentic)",
  "domain": "Finance & Budget",
  "archetype": "Pragmatist | Idealist | Hardliner | Fixer | Moralist | Schemer | Loyalist",
  "hidden_agenda": "One specific selfish goal this advisor is secretly pursuing — be concrete, not vague",
  "betrayal_trigger": "The specific player action that causes betrayal — must be observable in gameplay",
  "competence_rating": 1-10,
  "relationship_meter": 35-65,
  "dialogue": {
    "briefing": ["line 1", "line 2", "line 3"],
    "agreement": ["line 1", "line 2"],
    "disagreement": ["line 1", "line 2"],
    "betrayal": "Single dramatic line — make it personal and specific to their hidden agenda",
    "roast": ["line 1", "line 2"],
    "scandal_reaction": ["line 1", "line 2"]
  }
}
```

**Dialogue rules:**
- `briefing`: 3 lines the advisor says at the start of each turn. Should reveal their personality AND give real city context.
- `agreement`: 2 lines when player makes a decision they like. Short, in-character.
- `disagreement`: 2 lines when player ignores their advice. Pointed, not generic.
- `betrayal`: ONE line. This is their exit. Make it sting. Reference their specific hidden agenda.
- `roast`: 2 sarcastic lines about the city's state or the player's performance.
- `scandal_reaction`: 2 lines when a scandal breaks. Each advisor reacts differently based on personality.

#### `decisions`
Generate **exactly 5 policy decisions** — city-specific dilemmas the governor faces. These are NOT crises; they are routine governance choices.

```json
{
  "id": "snake_case_id",
  "title": "Short newspaper-headline-style title",
  "body": "2-3 sentences describing the dilemma. Be specific to this city. Include real stakes.",
  "turn_available": 1-10 (integer — stagger them, don't all start at 1),
  "unlock_flag": null,
  "options": [
    {
      "label": "Full option description — what the governor actually does",
      "tag": "SAFE | BOLD | CHAOS",
      "consequences": {
        "approval_delta": integer (-20 to +15),
        "budget_delta": integer (-300 to +200),
        "advisor_effects": [
          {
            "advisor_id": "finance | military_liaison | urban_planning | transport | religious_affairs",
            "trust_delta": integer (-20 to +15),
            "betrayal_risk_delta": integer (-15 to +20)
          }
        ],
        "scandal_risk": integer (0-80, percent chance of scandal),
        "public_reaction": "One-line citizen comment about this specific choice"
      }
    }
  ]
}
```

**Decision rules:**
- Each decision must have **exactly 3 options**: SAFE (conservative, lower risk), BOLD (decisive, higher stakes), CHAOS (unorthodox, high scandal risk, may have unexpected upsides)
- `advisor_effects` should make sense — finance advisor cares about budget decisions, urban_planning about environment, military_liaison about order, etc.
- `public_reaction` must be specific to what was decided, not generic

#### `crises`
Generate **exactly 4 crises** — major emergency events triggered on turns 4, 8, and 12. These are bigger than decisions.

```json
{
  "id": "snake_case_id",
  "name": "Crisis name (newspaper headline style)",
  "trigger": "One sentence: what happened and why it's now a crisis",
  "description": "3-4 sentences of situation detail. Include specific numbers, names, political actors. Make it feel urgent and real.",
  "turn_min": integer (1-10),
  "turn_max": integer (turn_min+4 to 12),
  "war_mode": false,
  "options": [
    {
      "id": "A",
      "label": "Full option description",
      "tag": "SAFE | BOLD | CHAOS",
      "consequences": {
        "approval_delta": integer (-25 to +15),
        "budget_delta": integer (-400 to +100),
        "scandal_risk": integer (0-80),
        "advisor_effects": [...]
      }
    }
  ]
}
```

**Crisis rules:**
- Each crisis must have exactly 3 options (A/B/C)
- Crises should feel more consequential than decisions — higher approval swings, larger budget costs
- Stagger `turn_min/turn_max` so crises are available at different points in the game
- The 4th crisis (turn 12 fallback) should feel like a final reckoning

#### `scandals`
Generate **exactly 3 scandals** — events that erupt randomly mid-turn. They must feel plausible for this city.

```json
{
  "id": "snake_case_id",
  "title": "Tabloid-style headline (max 8 words)",
  "description": "2 sentences. What happened, what makes it embarrassing.",
  "severity_tier": "minor | moderate | major | career_ending",
  "approval_penalty": integer (minor: -5, moderate: -12, major: -22, career_ending: -40)
}
```

#### `comment_library`
Generate comment pools for the scrolling public feed. Each pool needs **6-8 entries** reflecting the city's culture, language (mix local language/English), and specific local issues.

```json
{
  "positive": ["...", "..."],
  "neutral": ["...", "..."],
  "negative": ["...", "..."],
  "media": ["...", "..."],
  "politician": ["...", "..."],
  "activist": ["...", "..."],
  "street": ["...", "..."],
  "crisis": ["...", "..."],
  "scandal": ["...", "..."]
}
```

**Comment library rules:**
- `positive`: Citizens cautiously praising a good decision
- `neutral`: Wait-and-see skepticism, typical citizen cynicism
- `negative`: Specific complaints about real city problems
- `media`: Formatted like news headlines/tweets from the city's media outlet
- `politician`: Formatted like politician tweets/statements (include @handles or party names)
- `activist`: Formatted like NGO/advocacy group statements
- `street`: Raw street-level voice — informal, local slang, specific daily frustrations
- `crisis`: Panicked/angry reactions during an active crisis
- `scandal`: Cynical/outraged reactions to a political scandal

Mix local language phrases into `street` and `scandal` comments for authenticity.

#### `scandal_reactions`
City-specific one-line public reaction when each scandal tier hits. Capture the city's cultural voice.

```json
{
  "minor": "How the city reacts to a minor scandal (tone: resigned, unsurprised)",
  "moderate": "How the city reacts to a moderate scandal (tone: outraged but not shocked)",
  "major": "How the city reacts to a major scandal (tone: demands accountability)",
  "career_ending": "How the city reacts to a career-ending scandal (tone: finality, no way back)"
}
```

#### `romance_exposure`
How the city culturally reacts if the governor's romantic relationship with an advisor is exposed.

```json
{
  "severity": "minor | moderate | major | career_ending",
  "flavour": "One sentence describing the specific cultural reaction to this revelation"
}
```

**Severity guide by culture:**
- Conservative religious societies (Middle East, parts of Asia): `major` or `career_ending`
- Formal bureaucratic societies (Germany, Japan, Singapore): `moderate` or `major`
- Socially liberal cities (Amsterdam, SF, Montreal): `minor`
- Tabloid-loving cities (Manila, Lagos, UK): `moderate` (entertaining, not career-ending)
- Authoritarian states: `minor` (state media buries it)

---

### Quality Checklist

Before outputting, verify:
- [ ] All 5 advisor IDs are exactly: `finance`, `military_liaison`, `urban_planning`, `transport`, `religious_affairs`
- [ ] All advisor names are culturally authentic to the city
- [ ] Each betrayal line references the advisor's specific hidden agenda
- [ ] Each decision has exactly 3 options tagged SAFE/BOLD/CHAOS
- [ ] Each crisis has exactly 3 options tagged A/B/C
- [ ] `turn_available` on decisions are staggered (not all 1)
- [ ] Comment library has at least 6 entries per pool
- [ ] `scandal_reactions` and `romance_exposure` are filled in
- [ ] The overall tone matches the city's real political situation
- [ ] No placeholder text, no "etc.", no generic lines

---

### Reference Example

See Jakarta below as a structural and tonal reference. Note how:
- The intro is specific ("sinks three centimeters per year")
- Advisors have concrete hidden agendas tied to real Jakarta issues
- Comments mix Indonesian and English
- Crisis descriptions include numbers and named institutions
- The humor is dark but grounded

```json
[PASTE JAKARTA JSON HERE IF NEEDED — see jakarta.json in src/data/cities/]
```

---

### Your Request

Generate a complete city JSON for:

**City:** [FILL IN CITY NAME]
**Country/Region:** [FILL IN]
**Tier suggestion:** [easy/medium/hard/extreme/war — or leave blank for Gemini to decide]
**Special notes:** [Optional — any specific political situation, real events, or tone you want emphasized]

Output: A single valid JSON object. No explanation before or after. Just the JSON.

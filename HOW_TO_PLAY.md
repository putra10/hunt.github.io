# GOVERNED — How To Play

---

## Overview

You are appointed governor of a city in crisis. Survive a **12-turn term** by keeping your **approval rating above 0** and avoiding a public recall vote. Make decisions, handle crises, manage advisors, and balance your budget — all while the city's problems compound around you.

---

## Core Stats

| Stat | What It Measures | Game Over If… |
|------|-----------------|---------------|
| **Approval** | Public trust in your leadership (0–100) | Falls to 0 |
| **Budget** | City treasury in millions (M) | — (no hard limit, but deficit triggers consequences) |
| **Turn** | Current turn out of 12 | Reach 12 = term complete |

A score above **50 approval at turn 12** is considered a strong finish. Below 30 is a shaky survival.

---

## Turn Structure

Each turn runs in this order automatically when you press **END TURN**:

1. Unresolved scandals auto-fire their worst penalty
2. Advisor agendas tick (betray risk, relationship shift)
3. Bribe offers generated (if advisor agenda ≥ 60)
4. Crisis queue checked (queued crises activate)
5. End-of-game check (turn 12 or approval = 0)
6. Turn number increments
7. Passive tax income applied (city income per turn)
8. Budget pressure applied (deficit → approval penalty)
9. Scandal roll (random chance of new scandal)
10. Unrest roll (if conditions met → civil unrest pending)
11. Advisor briefings generated (intel for high-trust advisors)
12. Absence effects applied (skipped advisors penalise you)
13. Crisis trigger (new crisis may appear)

After pressing END TURN you must resolve any **pending decisions** before the next turn begins.

---

## Decisions

Each turn presents **1–3 decisions** (more on easy tiers, fewer on extreme/war). Each decision has 2–4 options with visible consequences:

- **approval_delta** — how much your approval changes
- **budget_delta** — how much your budget changes (in M)

Some options have tags like `COSTLY`, `RISKY`, `POPULAR`, or `COMPROMISE` that hint at trade-offs.

After resolving decisions, your **advisor recommendations** may appear on screen (see Advisors section).

---

## Crises

Crises are escalating events that force a single, permanent choice. Unlike decisions, **crises cannot be ignored** — they stay active until resolved.

Each crisis offers 2–4 response options. An additional **advisor secret option** may appear if your most-trusted non-betrayed advisor has **trust ≥ 60** and matches the domain (see Advisor Secret Options).

Crisis resolution affects approval and budget immediately. Choosing poorly can chain into worse crises or trigger public unrest.

---

## Advisors

You have 3–5 advisors depending on city tier (easy = 5, hard = 4, extreme/war = 3). Each advisor has a **domain** (finance, military_liaison, urban_planning, religious_affairs, transport) and a **trust** score (0–100).

### Trust Decay
Trust falls **−2 per turn** passively. To keep it up, use the **domain recovery** button in the Messenger — this costs agenda progress (−8) but restores +5 trust.

### Trust Thresholds
| Trust Level | Effect |
|-------------|--------|
| ≥ 75 | Trust-gated passive bonus activates (see below) |
| 70–100 | Intel warning replaces normal briefing line |
| 60–100 | Advisor secret crisis option available |
| 30–59 | Normal operation |
| < 30 | Domain advice hidden; budget/approval penalty |
| 0 | Risk of betrayal |

### Trust-Gated Passives (always-on when threshold met)
- **Finance trust ≥ 75** → +10M income every turn (applied in passive tax phase)
- **Military Liaison trust ≥ 75** → scandal chance reduced by 15%
- **Urban Planning trust ≥ 75** → civil unrest chance reduced by 20%

### Advisor Intel (trust > 70)
High-trust advisors replace their generic briefing with a real game warning:
- **Finance** → warns if next turn will run a deficit, or if deficit streak is active
- **Military Liaison** → warns about upcoming crisis windows or active unrest
- **Urban Planning** → warns if approval is dangerously close to the unrest threshold

### Advisor Recommendations
When you have a pending decision, the domain-matched advisor will recommend the option with the highest approval gain. A **REC** badge appears in the Messenger.

- Follow the recommendation → advisor gains **+3 trust**
- Ignore it → advisor loses **−2 trust**

### Emergency Powers (once per game per advisor)
Each advisor has a one-time emergency power that can be activated from the Messenger when conditions are met. Using it costs **−8 trust** regardless of outcome.

| Advisor | Power | Condition | Effect |
|---------|-------|-----------|--------|
| Finance | EMERGENCY LOAN | budget < −50 and trust ≥ 45 | +80M, −5 approval |
| Military Liaison | MARSHAL FORCES | active civil unrest and trust ≥ 50 | clears unrest immediately |
| Urban Planning | COMMUNITY INITIATIVE | approval < 45 and trust ≥ 45 | +10 approval, −20M |
| Religious Affairs | UNITY SERMON | approval < 50 and trust ≥ 45 | +7 approval |
| Transport | EMERGENCY RELIEF ROUTES | budget < 0 and trust ≥ 45 | +15M, −3 approval |

### Advisor Secret Crisis Options
During a crisis, if your most-trusted advisor (trust ≥ 60) has a matching domain, a **hidden fourth option** appears at the bottom of the response list. This option typically offers better approval at a budget cost, and uses the advisor's real-world connections to resolve the crisis.

### Agendas, Bribes, and Betrayal
Every advisor has a hidden agenda that fills over time. If it reaches 60+, they may offer you a **bribe** — accept for budget gain (but risks scandal), or decline to reduce agenda pressure. If you refuse to engage with an advisor repeatedly and their trust hits 0 with a full agenda, they may **betray you**, triggering an instant scandal and approval hit.

### Relationships
In the Messenger, you can invest in advisor relationships: **Trust → Romantic**. Romantic advisors give +4 trust/turn and extra loyalty, but carry a **5% romance exposure risk per turn** — if exposed, a scandal fires immediately. Some cities react more harshly to romance exposure than others.

---

## Budget System

Your city earns income each turn from the passive tax (based on city tax rate and tier). You spend money through decisions, crises, and contracts.

### Deficit Consequences
If your budget goes **negative**:
- Approval takes an extra hit each turn (−3 standard, −5 if budget < −200M)
- **consecutiveDeficitTurns** counter increments
- After **2 turns in deficit**, contract offers appear more frequently (+20% chance)

If budget recovers to ≥ 0, the deficit streak resets.

---

## Contracts

Contracts are financial relief offers that appear during turns. Each turn has a base chance of generating one (easy = 40%, down to war = 20%). **Two consecutive deficit turns** raise that chance by +20% (capped at 70%).

Contracts come in two forms:
- **Immediate** — lump-sum budget gain, one choice
- **Installment** — budget paid across multiple turns

You are usually presented with **two competing offers** — accept one, the other is cancelled. You may also decline all.

Accepting a contract may have side effects (small approval shifts, conditions). Read carefully before committing.

---

## Civil Unrest

When your city runs a **deficit AND approval drops below 37**, civil unrest may break out. The engine rolls each turn once conditions are met (starting from turn 3).

### Unrest Types
| Type | Triggers When | Severity |
|------|--------------|---------|
| Strike | approval 28–36 | Moderate — economic pressure |
| Demonstration | approval 18–27 | Serious — public confrontation |
| Riot | approval < 18 | Critical — order breakdown |

### Unrest Chance Formula
`Base 20% + debtPressure×15% + approvalPanic×20%`
where debtPressure scales with how deep in debt you are (max at −300M), and approvalPanic scales with how far below 37 you are. Urban Planning trust ≥ 75 reduces all unrest chance by 20%.

### Resolving Unrest
An unrest card appears on the dispatch screen. You must resolve it before it compounds. Options vary by type:

| Action | Cost | Notes |
|--------|------|-------|
| Meet Demands | −20M | Removes unrest peacefully |
| Stand Firm | −5 approval | Defies the crowd — risky |
| Engage | −25M, +2 approval | Dialogue; expensive but positive |
| Disperse | −10 approval | Forces dispersal; approval hit |
| Negotiate | −40M | Most expensive but safest |
| Crackdown | −18 approval, +30% scandal risk | Nuclear option — dangerous |

---

## Scandals

Scandals fire randomly each turn (chance set in Settings: low = 8%, normal = 20%, high = 38%). They have 4 severity tiers, and each city reacts differently based on its culture and history.

When a scandal fires, you have three choices:
- **Accept** — take the full approval penalty (safe but costly)
- **Suppress** — spend budget to bury it (may escalate if it fails)
- **Respond** — choose a specific response (outcome depends on tier + city)

Some decisions and unrest resolutions can also trigger scandals as a side effect.

---

## Tier Differences

| Tier | Advisors | Income | Scandal Freq | Starting Approval | Crises |
|------|----------|--------|-------------|-------------------|--------|
| Easy | 5 | High | Lower | 50–60 | Fewer, milder |
| Medium | 5 | Medium | Normal | 45–55 | Moderate |
| Hard | 4 | Lower | Normal | 40–50 | Frequent |
| Extreme | 3 | Low | Higher | 35–45 | Frequent + severe |
| War | 3 | Very low | High | 30–40 | Constant, severe |

**Extreme and War cities** also have a **passive approval drain** each turn — the city is so unstable that approval falls even if you do nothing wrong.

---

## End Conditions

| Condition | Result |
|-----------|--------|
| Reach turn 12 | Term complete → Report screen |
| Approval drops to 0 | Recalled → Report screen |
| Career-ending scandal | Forced resignation → Report screen |

The report screen shows final approval, budget, decisions made, crises resolved, and advisor status.

---

## Tips

- **Keep at least one advisor trust above 70** — their intel warnings are the best early warning system in the game.
- **Don't let two turns pass in deficit without a plan** — unrest can snowball faster than scandals.
- **Save emergency powers for real emergencies** — MARSHAL FORCES is the only instant unrest clear in the game.
- **Follow advisor recommendations when you can** — the trust gain compounds into better passives and intel over time.
- **On extreme/war tiers**, contracts are your lifeline. Prioritize installment contracts for long-term budget stability.
- **Crackdown is almost never worth it** — the approval hit plus scandal risk is usually worse than the cost of negotiating.

# Sango six-player identity game rules — draft

**Status:** Product draft 0.2  
**Players:** 6, each controlling one seat  
**Basis:** 三国杀 identity play, adapted to the roles, dual-general areas, and manual table implemented in `sango-page`

## 1. Game concept

Every player controls their own character. Seats form one clockwise circle, so seat order affects turns, distance, targeting, and effect resolution.

There are no fixed physical teams or team seating rows. Temporary alliances come from secretly assigned identities:

- 主公 and 忠臣 share an objective;
- 反贼 share an objective;
- 内奸 plays alone.

Players may cooperate, bluff, betray expectations, and target anyone when the card rules allow it.

## 2. Identities

For six players, shuffle and assign the exact role set used by `gameController.assignRoles()`:

- 1 × 主公 (Lord)
- 2 × 忠臣 (Loyalist)
- 2 × 反贼 (Rebel)
- 1 × 内奸 (Renegade)

Assignment is random and independent of seat. Players do not move after roles are assigned.

The 主公 reveals their identity. Every other identity remains private until its owner dies. A player may claim any identity verbally, but may not prove the claim by showing the hidden identity card.

**Current-code note:** `SgPlayer` currently makes both 主 and 内 public through the `king` CSS class. The recommended rule is to reveal only 主; public 内 should be treated as a UI defect unless the game intentionally chooses an open-Renegade variant.

## 3. Objectives and victory

| Identity | Objective |
| --- | --- |
| 主公 | Survive until every 反贼 and the 内奸 is dead |
| 忠臣 | Protect the 主公 and help eliminate all 反贼 and the 内奸 |
| 反贼 | Kill the 主公 |
| 内奸 | Become the final surviving character; the 主公 must die last |

Resolve victory immediately after a death:

1. If the 内奸 is the only living character, the 内奸 wins.
2. If the 主公 dies before that condition is met, the 反贼 win.
3. If the 主公 lives and every 反贼 and the 内奸 are dead, the 主公 and 忠臣 win.

Dead players share the result of their identity camp unless the group prefers survival-only scoring.

## 4. Kill rewards and penalties

- When any character kills a 反贼, the killer immediately draws three cards.
- If the 主公 kills a 忠臣, the 主公 discards every card in hand and equipment.
- Killing the 内奸 or 主公 has no separate card reward.

These consequences are not currently enforced by the application.

## 5. Setup

1. Seat all six players in a circle and assign each a stable seat number.
2. Randomly distribute the six identities listed above.
3. Reveal the 主公. Keep every other identity private.
4. Shuffle the playing-card deck.
5. Build a pool from enabled generals.
6. Deal seven general candidates to each player.
7. Each player chooses two generals and returns the others.
8. Reveal the chosen generals together.
9. Set maximum health using the dual-general rule below.
10. Each player draws four starting cards.
11. The 主公 takes the first turn. Turns then proceed clockwise.

### Dual-general rule

The repository has two active general slots and one shared health value per player. This draft therefore proposes:

- maximum health is `floor((General A health + General B health) / 2)`;
- the 主公 gains +1 maximum health;
- the player may use the printed skills of both generals;
- each general retains its printed faction for skills that check faction;
- 主公技 works only when printed on a general controlled by the 主公;
- selected generals cannot be replaced unless a skill explicitly permits it.

**Open decision:** A 365-general pool creates many untested two-general combinations. Start with a curated pool of 48–72 generals and publish a banned-combination list.

## 6. Turn order and phases

The 主公 begins. After a turn ends, the next living seat clockwise takes a turn. Dead seats are skipped.

Each turn has six phases:

1. **Preparation (准备阶段):** Resolve start-of-turn effects.
2. **Judgment (判定阶段):** Resolve delayed tricks in the judgment area.
3. **Draw (摸牌阶段):** Draw two cards from the draw-pile top.
4. **Play (出牌阶段):** Play legal cards and activate play-phase skills.
5. **Discard (弃牌阶段):** Discard until hand size is no greater than current health, unless modified.
6. **End (结束阶段):** Resolve end-of-turn effects.

A face-down character turns face up and skips the next turn they would take. A chained character stays chained until an effect removes the status or chained elemental damage resolves.

## 7. Playing cards

Cards move between the draw pile, hand, processing/table area, equipment, judgment, skill areas, and discard pile.

### Basic cards

- **杀:** During the play phase, target a character in attack range. Unless modified, use one 杀 per turn. The target may play 闪; otherwise it takes 1 damage. 火杀 and 雷杀 deal elemental damage.
- **闪:** Play when an effect requests a dodge.
- **桃:** During the play phase, recover 1 health for yourself. During dying rescue, recover 1 health for the dying character when legally allowed.
- **酒:** Empower the next 杀 used that turn to deal +1 damage. During your own dying rescue, 酒 may recover 1 health. Unless modified, use one 酒 per turn.

Tricks, delayed tricks, equipment, and general skills use their printed text. Playing equipment into an occupied matching slot discards the old equipment.

**Open decision:** The repository uses a 160-card deck and includes two copies of 闪电. Freeze and publish the final deck list before competitive play.

## 8. Distance and seat order

Distance is the shortest number of steps around the circle between two living characters. Dead characters are skipped.

- 杀 normally requires distance 1.
- A weapon changes its owner's attack range to the printed value.
- An offensive mount reduces its owner's distance to others by 1, minimum 1.
- A defensive mount increases others' distance to its owner by 1.
- Card and skill text may change distance or ignore range.

The client may rotate the visual table so the local player sits at the bottom. It must preserve and display the true clockwise seat sequence.

## 9. Damage, dying, and death

When a character takes damage:

1. reduce health by the damage amount;
2. resolve damage-triggered skills in legal order;
3. if health is 0 or less, begin dying rescue.

During rescue, start with the dying character and continue clockwise. Eligible players may use 桃; the dying character may also use 酒. Stop when health reaches at least 1 or everyone declines.

If rescue fails:

- reveal the dead player's identity;
- discard their hand, equipment, judgment cards, and temporary-area cards unless an effect says otherwise;
- remove the seat from turn and distance calculations;
- resolve death-triggered effects;
- apply kill reward or penalty;
- check victory.

## 10. Deck and table operations

Draw from the top of the draw pile. Cards deliberately placed at the bottom retain their chosen order.

When the draw pile is empty, shuffle the discard pile to create a new draw pile. Do not include cards in hands, equipment, judgment, processing, general, or skill areas.

Area 1 and Area 2 are generic holders for cards created, stored, or temporarily set aside by skills. The effect that moved a card there defines its meaning.

## 11. Information and communication

Public information includes:

- seat order and active player;
- the revealed 主公 identity;
- identities revealed by death;
- health, generals, equipment, judgment cards, and status markers;
- hand-card counts;
- public card moves and discard history.

Hands and living non-主 identities are private. There is no private team channel: discussion is public, and every player makes their own decisions.

## 12. Current application behavior

The application is a Firebase-synchronized manual tabletop. It currently supports:

- random role assignment;
- six or eight player records;
- two selected general slots;
- hands, equipment, judgment, and two generic areas;
- draw-pile top and bottom operations;
- reveal, draw, discard, drag-and-drop, shuffle, and recycle;
- direct health, maximum-health, chained, and face-down controls.

It does not enforce turn order, phase timing, target legality, range, card effects, skill effects, damage, dying, death, identity victory, rewards, or penalties.

## 13. Current control mapping

| Control | Meaning |
| --- | --- |
| 身份 | Randomly assign identities |
| 发将 | Deal general candidates |
| 洗牌 | Recycle and shuffle playing cards |
| 清台 | Reset player zones and decks; host-only action |
| 摸 | Move selected cards to the local hand |
| 弃 | Move selected cards to discard |
| 出 | Currently also discards; should stage a played card for resolution |
| 亮 | Toggle selected cards face up |
| 装备 | Equipment area |
| 判定 | Judgment area |
| 区1 / 区2 | Generic skill-card areas |
| Rotate icon | Face-down status |
| Chain icon | Chained status |

## 14. Decisions before rules-engine work

| Topic | Recommended default | Alternative |
| --- | --- | --- |
| Identity visibility | Only 主 public; reveal others on death | Keep current public 内 behavior |
| Generals | Two public generals per seat | One general or concealed generals |
| Health | Floor of average general health; 主 +1 | Fixed 4; 主 5 |
| General pool | Curated 48–72 | All enabled generals |
| Deck | Freeze a reviewed subset | Keep all 160 cards |
| Extra areas | Skill-specific labels when used | Permanent Area 1 and Area 2 |

## Reference note

This mode borrows 三国杀 card timing and identity objectives. It is not the fixed-seat Commander/Vanguard 3v3 tournament format; every player controls one independently seated character, while identities create hidden virtual alliances.

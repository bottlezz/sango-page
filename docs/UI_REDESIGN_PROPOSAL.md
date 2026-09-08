# Sango manual-table UI redesign proposal

**Status:** Product and implementation draft 0.3  
**Goal:** Keep the current self-served tabletop model and spatial layout, while making it clearer, more polished, and usable on phones.

## 1. Product principle

Sango is a synchronized virtual card table, not an automatic rules engine.

- Players execute card movement, health changes, status changes, skill effects, and corrections themselves.
- The UI should make manual actions quick and understandable without deciding whether they are legal.
- General skill text explains effects; players perform those effects through the shared table controls.
- The application synchronizes visible state through Firebase.
- Optional guidance may describe an action, but it should not block custom skills or house rules.

## 2. Preserve the current table topology

The desktop redesign keeps the existing layout:

```text
┌──────────┬──────────┬──────────┬──────────┐
│ p2       │ p3       │ p4       │ p5       │
├──────────┴──────────┴──────────┼──────────┤
│ shared discard / card area     │ p6       │
│ tools + draw pile + deck zones │          │
├────────────────────────────────┴──────────┤
│ p1 local player: generals, zones, hand    │
└───────────────────────────────────────────┘
```

This is the current `slot0`–`slot5` arrangement after rotating the table around the local player. It preserves the randomized clockwise seat order and keeps the local hand easy to reach.

Do not regroup players by inferred identity or alliance. Roles create virtual alliances, but every player controls their own seat.

## 3. What changes visually

### Player panels

Keep the same information and make it denser:

- two general portraits;
- player key and name;
- public or local-private identity marker;
- clickable health and maximum-health controls;
- hand, Area 1, and Area 2 counts;
- equipment and judgment summaries;
- face-down and chained toggles.

Use a neutral jade panel for every player. Gold marks the local seat, cyan marks a toggled status, bronze marks the public 主公, and red is reserved for damage or dangerous actions.

### Shared table

Keep the existing public area and expose:

- 身份, 发将, 洗牌, manual correction, and 清台 tools;
- the discard and public-resolution cards;
- draw pile count;
- 牌堆顶 and 牌堆底 drop zones;
- general deck count;
- draw and reveal-top shortcuts.

Setup and destructive operations remain visible but sit in a distinct utility rail. 清台 receives a danger treatment and should require a confirmation.

### Local player

Keep the local player across the bottom with:

- two full-height general cards;
- private identity;
- direct health controls;
- face-down and chained toggles;
- tabs for hand, equipment, judgment, Area 1, Area 2, and general skills;
- a large hand-card strip;
- the manual selected-card toolbar.

## 4. Manual card interaction

Card selection supports one or several cards. Selecting cards enables:

- **摸** — move to the local hand;
- **弃** — move to the discard pile;
- **亮** — toggle face-up state;
- **出** — place in the shared resolution area;
- **移动到…** — choose a player and destination zone.

Drag-and-drop remains available for experienced players. During a drag, valid storage destinations light up, including:

- any player's hand, equipment, judgment, Area 1, or Area 2;
- public/discard area;
- draw-pile top or bottom;
- general candidate and active-general areas for general cards.

The UI reports what it moved but does not calculate the card or skill effect. For example: `Moved 2 cards to p4 · Area 1`.

## 5. Skills remain self-served

Clicking a general skill opens its complete description and a compact manual-action palette:

- draw cards;
- discard selected cards;
- move selected cards;
- reveal or hide cards;
- change health or maximum health;
- toggle face-down or chained state;
- add a temporary labeled zone or marker.

These actions are conveniences, not automated skill implementations. The player decides the correct sequence and targets.

## 6. Identity and seating

Keep random role assignment using the code-defined six-player set: 主 ×1, 忠 ×2, 反 ×2, 内 ×1.

- 主 is public.
- The local player sees their own role.
- Other living roles display 匿 unless intentionally revealed.
- Seat labels `p1`–`p6` remain visible.
- The table rotates around the local seat without changing clockwise order.

The current code also reveals 内 through the `king` class. If that is not an intended house rule, restrict public role styling to 主.

## 7. Card and general presentation

- Use a 5:7 card proportion with horizontal names.
- Keep suit and rank readable at the upper left.
- Raise selected cards and add a strong gold outline.
- Show full card text in a preview instead of squeezing it onto the small card.
- Keep general art large, with name and faction overlays.
- Open skill text on click or tap; do not rely on hover.
- Use the existing images and Chinese data in `sango-page`.

## 8. Mobile layout

Below 900 px:

1. Show the five remote players in one horizontally scrollable, snap-aligned rail.
2. Show the shared table below the rail.
3. Keep the local hand and action controls pinned near the bottom.
4. Make public cards horizontally scrollable.
5. Keep manual table tools in a compact five-button row.
6. Shrink remote general portraits and show opponent health as `HP current/max` so zone and status information stays visible.

Below 620 px:

- show the local generals as compact thumbnails beside the player summary;
- keep the local `− / ＋` health controls visible so each player can adjust their own health;
- use a horizontal hand carousel;
- stack the selected-card description above the actions;
- keep buttons at least 44 px high in the production implementation;
- replace precision drag requirements with tap-select → 移动到…;
- open player zones and skill text in bottom sheets.

## 9. Responsive desktop target

At 1366 × 768, the entire desktop table should fit without page scrolling:

- four remote panels across the top;
- p6 beside the public table;
- local player and hand across the bottom;
- readable cards at default browser zoom.

## 10. Component changes

| Component | Change |
| --- | --- |
| `SgTable` | Keep current slots; replace fixed width with responsive grid and a mobile flow |
| `SgPlayer` | Compact existing information; add clear zone buttons and touch-friendly status toggles |
| `SgCard` | Improve proportion, selection, preview, and tap interaction |
| `SgJiang` | Use existing art prominently; open skill details on click/tap |
| `SgArea` | Keep generic reusable areas; add visible labels and drop feedback |
| `SgPaiArea` | Keep top/bottom drop behavior; show compact pile counts |
| `SgHpbar` | Preserve direct editing with larger controls and numeric health |
| `SgGameMenu` | Preserve room/seat flow; improve labels and separate setup from live play |
| `gameController` | Keep low-level card moves; add reusable manual commands and an action description |

## 11. Delivery sequence

### Phase 1 — restyle without changing behavior

- Apply jade table surfaces, parchment cards, clearer type, and spacing.
- Preserve all current zones, buttons, card movement, and Firebase paths.
- Implement the responsive desktop grid and mobile opponent rail.
- Add tap-accessible skill and card previews.

### Phase 2 — improve manual operations

- Add multi-select summaries and labeled action buttons.
- Add tap-select destination sheets for mobile.
- Highlight drop destinations.
- Add undo for the most recent manual move when Firebase state permits it.
- Add a compact public action log.

### Phase 3 — optional helpers

- Add reusable macros for common manual effects such as draw N, discard N, lose/recover health, and move cards.
- Add custom markers and named skill zones.
- Keep all helpers optional and reversible; do not require a full rules engine.

## 12. Acceptance criteria

1. Existing players can locate every current feature without relearning the table.
2. The desktop view preserves the current p2–p5 top row, p6 right side, public center, and local bottom layout.
3. Random seating and role-based virtual alliances are not replaced by team grouping.
4. Every current manual card destination remains accessible.
5. Skills can be resolved manually without the interface rejecting unusual moves.
6. The full desktop table fits at 1366 × 768.
7. At 390 px width, remote players use a horizontal rail and the local hand stays reachable.
8. Touch users can move cards without dragging.
9. Health, maximum health, chained, face-down, visibility, and generic zones remain directly controllable.

## 13. Mock

The interactive mock is `SANGO_UI_MOCK_V2.html`. It demonstrates the preserved desktop topology, manual tools, multi-card selection, health/status controls, and mobile layout. It intentionally does not enforce card or skill legality.

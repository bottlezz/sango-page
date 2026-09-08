# Sango design documents

These documents describe the current six-player, identity-based virtual card table. They distinguish observed code behavior from proposed rules and interface changes.

- [GAME_RULES_DRAFT.md](./GAME_RULES_DRAFT.md) drafts the role-based rules inferred from the code and the 三国杀 foundation.
- [UI_REDESIGN_PROPOSAL.md](./UI_REDESIGN_PROPOSAL.md) proposes a cleaner version of the existing tabletop layout and manual interaction model.
- [SANGO_UI_MOCK_V2.html](./SANGO_UI_MOCK_V2.html) is the interactive, mobile-friendly mock that preserves the current manual tabletop layout.

## Current implementation

The application is a Firebase-synchronized virtual table. It supports six seats, shared draw and discard areas, player hands, equipment and judgment zones, two extra card zones, two general slots, health editing, chained/flipped markers, card visibility, drag-and-drop movement, and manual deck operations.

It intentionally behaves as a self-served table: players manually execute skill effects, card movement, health changes, status changes, corrections, and victory. The redesign preserves that flexibility instead of requiring a full rules engine.

Both documents are product drafts. Decisions marked **Open decision** should be settled before implementing production UI changes or optional helpers.

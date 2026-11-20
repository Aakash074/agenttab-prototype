# AgentTab pre-hackathon prototype (disclosure)

This repo is the **pre-existing work** for the BCH BLAZE 2026 entry
[AgentTab](https://github.com/Aakash074/agenttab) (live: https://agenttab-bch.onrender.com).

**No hosted demo of the prototype existed; its pre-kickoff state is commit
[631e586](https://github.com/Aakash074/agenttab-prototype/tree/631e586).** The prototype had no UI.

What it contains (all created before the official build start, 2026-11-14 14:00 UTC):
- `contracts/AgentChannel.cash`: a 31-line CashScript covenant sketch for a voucher-based payment channel.
- `test/channel.test.mjs`: 5 tests against a mock network (`node test/channel.test.mjs`).
- An empty Vite + React + TypeScript template (`src/`), unchanged.

Timeline: see [PRE_HACKATHON_DISCLOSURE.md](PRE_HACKATHON_DISCLOSURE.md). The submitted project lives in the
main repo, which was started from scratch after kickoff; its README lists what changed against this prototype.

# School Browser — daily AI blocklist

This list is updated automatically every morning (about 5:37 AM Eastern) with new or renamed AI websites. The School Browser Guard extension downloads it every few hours and adds these sites to its built-in blocklist (a backup copy is kept on the Teacher Dashboard's Firebase Hosting).

- 👩‍🏫 **Teacher Dashboard:** https://school-browser-b7de3.web.app/
- 📄 **[Read the daily report](REPORT.md)** — what was added each day and why.
- 🚫 **Unblock a site:** Teacher Dashboard → Blocked sites → Unblock (takes effect within a minute).
- 🛡️ Sites in [`protected.json`](protected.json) (Google Docs/Classroom, Microsoft 365/Teams, Clever, Khan Academy, …) can never be added.

## Files
| File | What it is |
|---|---|
| `blocklist.json` | The list School Browser downloads |
| `REPORT.md` | Readable daily report (generated) |
| `runs.json` | One line per daily run, including days with no additions |
| `protected.json` | Sites the update must never block |
| `builtin.json` | Copy of School Browser's built-in list (already blocked; the update skips these) |
| `docs/index.html` | Sends the old dashboard address to the new one |
| `DAILY_UPDATE_INSTRUCTIONS.md` | What the automated update does and how |
| `tools/validate.js` | Refuses unsafe changes (removals, protected sites, bad entries, too many at once) |
| `tools/build-report.js` | Rebuilds `REPORT.md` |

// Rebuilds REPORT.md (the readable daily report) from blocklist.json.
const fs = require('fs');
const path = require('path');
const { ROOT, readJSON } = require('./common');

const list = readJSON('blocklist.json');
let runs = [];
try { runs = readJSON('runs.json').runs || []; } catch {}
const byDate = new Map();
for (const e of list.sites) { if (!byDate.has(e.added)) byDate.set(e.added, []); byDate.get(e.added).push(e); }
const dates = new Set([...byDate.keys(), ...runs.map((r) => r.date)]);
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const label = { 'ai-chatbot': 'AI chatbot', 'ai-writing': 'AI writing tool', 'ai-humanizer': 'AI "humanizer"', 'ai-homework': 'AI homework helper', 'ai-image-or-video': 'AI image/video tool', 'ai-other': 'AI tool', 'homework-answers': 'Homework-answer site', 'filter-bypass': 'Filter bypass / proxy' };

let md = `# Daily AI blocklist report\n\nEvery morning an automated check looks for new or renamed AI websites and adds them to School Browser's blocklist. This page shows what was added and why.\n\n`;
md += `- **Sites added so far:** ${list.sites.length}\n- **Last updated:** ${list.updated ? new Date(list.updated).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' Eastern' : 'not yet'}\n`;
md += `- **To unblock a site:** open the Teacher Dashboard → 🚫 Blocked sites → Unblock. Unblocking takes effect on students' browsers within a minute.\n\n`;
for (const d of [...dates].sort().reverse()) {
  md += `## ${fmt(d)}\n\n`;
  const items = byDate.get(d) || [];
  const run = runs.find((r) => r.date === d);
  if (!items.length) md += `No new AI sites found${run && run.note ? ` — ${run.note}` : ''}.\n\n`;
  else {
    if (run && run.note) md += `${run.note}\n\n`;
    md += `| Site | Type | Why it was blocked |\n|---|---|---|\n`;
    for (const e of items) md += `| \`${e.site}\` | ${label[e.category] || e.category} | ${String(e.reason).replace(/\|/g, '\\|')} |\n`;
    md += '\n';
  }
}
if (!dates.size) md += `_No updates yet. The first one will appear after the next morning run._\n`;
fs.writeFileSync(path.join(ROOT, 'REPORT.md'), md);
console.log('REPORT.md updated');

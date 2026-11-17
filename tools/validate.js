// Checks blocklist.json before it is saved. Exit code 1 = do not commit.
// Usage: node tools/validate.js [--builtin path/to/school-browser/config.json]
const { execSync } = require('child_process');
const { ROOT, SITE_RE, CATEGORIES, readJSON, hitsProtected } = require('./common');

const MAX_NEW_PER_RUN = 25;
const MAX_TOTAL = 5000;
const errors = [];
let list;
try { list = readJSON('blocklist.json'); } catch (e) { console.error('blocklist.json is not valid JSON: ' + e.message); process.exit(1); }
const protectedSites = readJSON('protected.json').sites;

let builtin = [];
const bi = process.argv.indexOf('--builtin');
if (bi > 0) { try { builtin = JSON.parse(require('fs').readFileSync(process.argv[bi + 1], 'utf8')).blockedSites || []; } catch (e) { errors.push('could not read built-in list: ' + e.message); } }

if (list.version !== 1 || !Array.isArray(list.sites)) errors.push('blocklist.json must have "version": 1 and a "sites" array');
const sites = Array.isArray(list.sites) ? list.sites : [];
if (sites.length > MAX_TOTAL) errors.push(`too many sites (${sites.length} > ${MAX_TOTAL})`);

const seen = new Set();
for (const [i, e] of sites.entries()) {
  const where = `sites[${i}] (${e && e.site})`;
  if (!e || typeof e !== 'object') { errors.push(`${where}: not an object`); continue; }
  if (typeof e.site !== 'string' || !SITE_RE.test(e.site) || e.site !== e.site.toLowerCase().replace(/^www\./, '')) errors.push(`${where}: "site" must be a lowercase domain without www. (optionally /path), e.g. "example-ai.com"`);
  if (typeof e.reason !== 'string' || e.reason.length < 10 || e.reason.length > 200) errors.push(`${where}: "reason" must be 10-200 characters`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.added || '')) errors.push(`${where}: "added" must be a date like 2026-11-17`);
  if (!CATEGORIES.includes(e.category)) errors.push(`${where}: "category" must be one of ${CATEGORIES.join(', ')}`);
  if (seen.has(e.site)) errors.push(`${where}: listed twice`);
  seen.add(e.site);
  for (const p of protectedSites) if (typeof e.site === 'string' && hitsProtected(e.site, p)) errors.push(`${where}: would block protected site ${p}`);
  if (builtin.includes(e.site)) errors.push(`${where}: already in School Browser's built-in list`);
}

// Compare with the last saved version: sites may only be added, never removed or changed.
let previous = [];
try { previous = JSON.parse(execSync('git show HEAD:blocklist.json', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString()).sites || []; } catch {}
const now = new Map(sites.map((e) => [e && e.site, e]));
for (const old of previous) {
  if (!now.has(old.site)) errors.push(`site removed: ${old.site} (the daily update may only add; the teacher unblocks from the dashboard)`);
  else if (JSON.stringify(now.get(old.site)) !== JSON.stringify(old)) errors.push(`site changed: ${old.site} (existing entries must not be edited)`);
}
const added = sites.filter((e) => e && !previous.some((o) => o.site === e.site));
if (added.length > MAX_NEW_PER_RUN) errors.push(`${added.length} new sites in one run (max ${MAX_NEW_PER_RUN}); add only the clearest cases`);

if (errors.length) { console.error('NOT OK:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`OK: ${sites.length} sites, ${added.length} new: ${added.map((e) => e.site).join(', ') || 'none'}`);

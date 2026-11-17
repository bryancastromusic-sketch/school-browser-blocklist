// Shared helpers for the blocklist tools (no dependencies).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SITE_RE = /^(?=.{4,253}(\/|$))([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}(\/[A-Za-z0-9._~!$&'()*+,;=:@%\/?-]{1,200})?$/;
const CATEGORIES = ['ai-chatbot', 'ai-writing', 'ai-humanizer', 'ai-homework', 'ai-image-or-video', 'ai-other', 'homework-answers', 'filter-bypass'];

const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const host = (site) => site.split('/')[0];
// true when blocking `site` would also block the protected host `p`
function hitsProtected(site, p) {
  const h = host(site);
  const ph = host(p);
  return h === ph || ph.endsWith('.' + h);
}
module.exports = { ROOT, SITE_RE, CATEGORIES, readJSON, host, hitsProtected };

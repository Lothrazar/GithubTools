// shared.js — token auth utilities used by all GitHub Tools pages

const TOKEN_KEY = 'gh_token';

function getToken() {
  if (typeof localStorage === 'undefined') return '';  // no-op outside a browser (e.g. under node --test)
  return localStorage.getItem(TOKEN_KEY) || '';
}

function authHeaders() {
  const t = getToken();
  const h = { 'Accept': 'application/vnd.github+json' };
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

function updateRateBadge() {
  const badge = document.getElementById('rate-badge');
  if (!badge) return;
  const hasToken = !!getToken();
  badge.textContent = hasToken ? 'Authenticated — 5,000 req/hr' : 'Unauthenticated — 60 req/hr';
  badge.className   = hasToken ? 'rate-badge auth' : 'rate-badge anon';
}

if (typeof document !== 'undefined') {
  updateRateBadge();
  window.addEventListener('storage', e => {
    if (e.key === TOKEN_KEY) updateRateBadge();
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Where the word "documentation" in GitHub's rate-limit message should point: our Settings page
// (relative to the tool pages in pages/, which is where error messages are shown)
const SETTINGS_URL = 'settings.html';

// Escapes an error message for innerHTML and turns the "documentation" in
// "Check out the documentation for more details" into a link to the Settings page.
function errorHtml(message) {
  return escHtml(message).replace(
    /Check out the documentation/,
    `Check out the <a href="${SETTINGS_URL}">documentation</a>`
  );
}

async function checkGitHubResponse(res, notOkMessage) {
  if (res.status === 403 || res.status === 429) {
    const msg = await res.json().catch(() => ({}));
    const extra = !getToken() ? ' Set an API token in Settings for higher rate limits.' : '';
    throw new Error((msg.message || `API error ${res.status}`) + extra);
  }
  if (!res.ok) throw new Error(notOkMessage ? notOkMessage(res.status) : `API error ${res.status}`);
}

async function apiFetch(url, notOkMessage) {
  const res = await fetch(url, { headers: authHeaders() });
  await checkGitHubResponse(res, notOkMessage);
  return res.json();
}

async function fetchAllPages(url, { maxPages = Infinity, isCancelled, notOkMessage } = {}) {
  let results = [];
  let page = 1;
  while (page <= maxPages) {
    if (isCancelled && isCancelled()) throw new Error('cancelled');
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}page=${page}&per_page=100`, { headers: authHeaders() });
    await checkGitHubResponse(res, notOkMessage);
    const data = await res.json();
    results = results.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return results;
}

// CommonJS export for `node --test` — no-op in the browser (module is undefined there).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getToken, authHeaders, escHtml, errorHtml, checkGitHubResponse, apiFetch, fetchAllPages };
}

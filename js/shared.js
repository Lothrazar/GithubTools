// shared.js — token auth utilities used by all GitHub Tools pages

const TOKEN_KEY = 'gh_token';

function getToken() {
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

updateRateBadge();

window.addEventListener('storage', e => {
  if (e.key === TOKEN_KEY) updateRateBadge();
});

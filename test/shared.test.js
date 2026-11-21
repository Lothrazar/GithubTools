const { test } = require('node:test');
const assert = require('node:assert/strict');
const { escHtml, errorHtml, fetchAllPages, apiFetch } = require('../js/shared.js');

test('escHtml escapes <, >, &, and "', () => {
  assert.equal(escHtml('<img src=x>'), '&lt;img src=x&gt;');
  assert.equal(escHtml('A & B'), 'A &amp; B');
  assert.equal(escHtml('say "hi"'), 'say &quot;hi&quot;');
});

test('escHtml passes plain text through unchanged', () => {
  assert.equal(escHtml('my-repo_123'), 'my-repo_123');
});

test('fetchAllPages concatenates a single short page', async (t) => {
  t.mock.method(global, 'fetch', async () => ({
    ok: true, status: 200, json: async () => ([{ id: 1 }, { id: 2 }]),
  }));
  const result = await fetchAllPages('https://api.example.com/repos');
  assert.deepEqual(result, [{ id: 1 }, { id: 2 }]);
});

test('fetchAllPages walks pages until one returns fewer than 100 items', async (t) => {
  let call = 0;
  t.mock.method(global, 'fetch', async () => {
    call++;
    const page = call === 1 ? Array(100).fill({ id: call }) : [{ id: 999 }];
    return { ok: true, status: 200, json: async () => page };
  });
  const result = await fetchAllPages('https://api.example.com/repos');
  assert.equal(result.length, 101);
  assert.equal(call, 2);
});

test('fetchAllPages stops at maxPages even when every page is full', async (t) => {
  let call = 0;
  t.mock.method(global, 'fetch', async () => {
    call++;
    return { ok: true, status: 200, json: async () => Array(100).fill({}) };
  });
  const result = await fetchAllPages('https://api.example.com/repos', { maxPages: 2 });
  assert.equal(result.length, 200);
  assert.equal(call, 2);
});

test('fetchAllPages throws the caller-supplied message on a non-ok, non-rate-limit status', async (t) => {
  t.mock.method(global, 'fetch', async () => ({
    ok: false, status: 404, json: async () => ({}),
  }));
  await assert.rejects(
    fetchAllPages('https://api.example.com/repos', { notOkMessage: s => `nope ${s}` }),
    /nope 404/
  );
});

test('fetchAllPages throws a rate-limit message with a token hint on 403', async (t) => {
  t.mock.method(global, 'fetch', async () => ({
    ok: false, status: 403, json: async () => ({ message: 'API rate limit exceeded' }),
  }));
  await assert.rejects(
    fetchAllPages('https://api.example.com/repos'),
    /API rate limit exceeded.*Set an API token/
  );
});

test('fetchAllPages throws "cancelled" and never calls fetch once isCancelled() is true', async (t) => {
  const fetchMock = t.mock.method(global, 'fetch', async () => ({
    ok: true, status: 200, json: async () => ([]),
  }));
  await assert.rejects(
    fetchAllPages('https://api.example.com/repos', { isCancelled: () => true }),
    /cancelled/
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('apiFetch returns parsed JSON for a single non-paginated request', async (t) => {
  t.mock.method(global, 'fetch', async () => ({
    ok: true, status: 200, json: async () => ({ name: 'GithubTools' }),
  }));
  const result = await apiFetch('https://api.example.com/repos/x/y');
  assert.deepEqual(result, { name: 'GithubTools' });
});

test('errorHtml links the word documentation to the settings page in the GitHub rate limit message', () => {
  const out = errorHtml('API rate limit exceeded. Check out the documentation for more details.');
  assert.match(out, /Check out the <a href="settings\.html">documentation<\/a> for more details\./);
});

test('errorHtml escapes HTML and leaves other messages without a link', () => {
  assert.equal(errorHtml('bad <b>name</b>'), 'bad &lt;b&gt;name&lt;/b&gt;');
});

# GitHub Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Live page:** [lothrazar.github.io/GithubTools](https://lothrazar.github.io/GithubTools)

Simple browser-based utilities for auditing your GitHub repos. No backend, no build step, no installs — just open the HTML files directly or serve them statically.

## Tools

### Issue Auditor (`pages/issues.html`)
Scans all repos for open issues and pull requests.
- Counts tagged vs. untagged issues per repo
- Filter to repos that need attention, have PRs, or are fully clean
- Links directly to the relevant GitHub issues/PRs page
- Progress bar with live updates and cancel support

### Branch Auditor (`pages/branches.html`)
Shows the default branch of every repo across your account.
- Spot repos still on `master` vs `main`
- Filter by branch name, sort by last push date
- Summary stats showing branch name distribution

## Authentication

Set a GitHub personal access token once via the **Settings** page and it is shared across all tools automatically:

- **Without a token:** 60 requests/hour (GitHub's unauthenticated limit)
- **With a token:** 5,000 requests/hour

Generate one at [github.com/settings/tokens](https://github.com/settings/tokens) — only `public_repo` (read-only) scope is needed. Tokens are stored in `localStorage` in your browser only, never sent anywhere else, and cannot be read back out of the UI once saved.

## Usage

Open `index.html` in a browser, or serve the folder with any static file server:

```sh
npx serve .
# or
python -m http.server
```

## Files

```
index.html          — homepage
LICENSE             — MIT licence
README.md
css/
  shared.css        — common styles for all audit pages
js/
  shared.js         — shared auth utilities (getToken, authHeaders, etc.)
pages/
  issues.html       — Issue Auditor
  branches.html     — Branch Auditor
  settings.html     — Settings (API token management)
```

## License

MIT — see [LICENSE](LICENSE).

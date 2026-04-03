# GitHub Tools

Simple browser-based utilities for auditing your GitHub repos. No backend, no build step, no installs — just open the HTML files directly or serve them statically.

## Tools

### Issue Auditor (`issues.html`)
Scans all repos for open issues and pull requests.
- Counts tagged vs. untagged issues per repo
- Filter to repos that need attention, have PRs, or are fully clean
- Links directly to the relevant GitHub issues/PRs page
- Progress bar with live updates and cancel support

### Branch Auditor (`branches.html`)
Shows the default branch of every repo across your account.
- Spot repos still on `master` vs `main`
- Filter by branch name, sort by last push date
- Summary stats showing branch name distribution

## Authentication

All pages accept an optional GitHub personal access token:

- **Without a token:** 60 requests/hour (GitHub's unauthenticated limit)
- **With a token:** 5,000 requests/hour

Generate one at [github.com/settings/tokens](https://github.com/settings/tokens) — only `public_repo` (read-only) scope is needed. Tokens are stored in `localStorage` in your browser only and never sent anywhere else.

## Usage

Open `index.html` in a browser, or serve the folder with any static file server:

```sh
npx serve .
# or
python -m http.server
```

## Files

```
index.html    — homepage with links to all tools
issues.html   — Issue Auditor
branches.html — Branch Auditor
shared.css    — common styles used by the audit pages
```

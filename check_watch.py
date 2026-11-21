
import os
import json
import re
import urllib.request
import urllib.error
 # the great autowatch
USERNAME = "lothrazar"
TOKEN = os.environ.get("GITHUB_TOKEN", "")

headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": USERNAME  # GitHub API requires a User-Agent header
}

def fetch_all(url):
    items = []
    while url:
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                items.extend(data)

                # Parse the Link header manually (urllib has no .links helper)
                link_header = response.headers.get("Link", "")
                next_url = None
                if link_header:
                    match = re.search(r'<([^>]+)>;\s*rel="next"', link_header)
                    if match:
                        next_url = match.group(1)
                url = next_url
        except urllib.error.HTTPError as e:
            print(f"HTTP error {e.code}: {e.read().decode()}")
            break
    return items

# 1. Repos you own
owned_repos = [r['full_name'] for r in fetch_all(
    "https://api.github.com/user/repos?per_page=100&affiliation=owner"
)]

# 2. Repos you're watching
watched_repos = {r['full_name'] for r in fetch_all(
    "https://api.github.com/user/subscriptions?per_page=100"
)}

# 3. Diff
unwatched_owned_repos = [r for r in owned_repos if r not in watched_repos]

print(f"Total repositories you own: {len(owned_repos)}")
print(f"Total repositories you watch globally: {len(watched_repos)}")
print("\n--- Repositories you own but are NOT watching ---")

if unwatched_owned_repos:
    for repo in unwatched_owned_repos:
        print(f"❌ NOT WATCHING: {repo}")
else:
    print("✅ Looking good! You are successfully watching 100%")
 

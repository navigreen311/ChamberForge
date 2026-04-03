# Branch Protection Rules

These settings should be configured via the GitHub UI or API for the `main` branch.

## Recommended Settings

### Pull Request Reviews
- **Require pull request reviews before merging**: Enabled
- **Required number of approvals**: 1
- **Dismiss stale pull request approvals when new commits are pushed**: Enabled

### Status Checks
- **Require status checks to pass before merging**: Enabled
- **Required checks**:
  - `ci` (CI workflow)
  - `python-audit` (Security scan)
  - `npm-audit` (Security scan)
  - `secrets-scan` (Security scan)
- **Require branches to be up to date before merging**: Enabled

### Branch Restrictions
- **Do not allow force pushes**: Enabled
- **Do not allow deletions**: Enabled

## How to Configure

1. Go to **Settings > Branches** in the GitHub repository
2. Click **Add branch protection rule**
3. Set **Branch name pattern** to `main`
4. Enable the settings listed above
5. Click **Create** / **Save changes**

Alternatively, use the GitHub API:
```bash
gh api repos/OWNER/REPO/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field required_status_checks='{"strict":true,"contexts":["ci","python-audit","npm-audit","secrets-scan"]}' \
  --field enforce_admins=true \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

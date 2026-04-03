# test-suite

Create or extend an automated test suite (unit, integration, e2e) and wire it into CI if requested.

## Arguments

$ARGUMENTS

Parse the following from arguments:
- **target**: file, module, or feature to test (e.g., `backend/app/services/auth`, `frontend/src/components/Dashboard`)
- **coverage_goal**: target coverage percentage (e.g., `80%`, `90%`)
- **test_kinds**: comma-separated list of `unit`, `integration`, `e2e`
- **ci_provider**: (optional) `github-actions`, `gitlab-ci`, `none`
- **seed_data**: (optional) description of fixtures or seed data needed

---

## Process

### 1. Inventory
- List existing tests for the target.
- Identify testing frameworks already in use (pytest, Jest, Vitest, Playwright, etc.).
- Note current coverage if measurable.

### 2. Gap Analysis
- Compare existing tests against the target's public API / user flows / acceptance criteria.
- Identify untested paths: happy paths, error paths, edge cases, boundary values.

### 3. Add Tests
- Write tests organized by kind (unit → integration → e2e).
- Use descriptive `describe` / `it` or `def test_` names that read like acceptance criteria.
- Add fixtures, factories, and teardown as needed.

### 4. Test Scripts
- Add or update npm/make/pytest scripts so tests can be run with a single command.
- Example: `make test-unit`, `npm run test:integration`, `pytest tests/ -v`

### 5. CI Configuration (if ci_provider specified)
- Add or update CI workflow file (e.g., `.github/workflows/test.yml`).
- Include: install deps → run linter → run tests → upload coverage.

### 6. Run & Summarize
- Execute all tests. Report: total, passed, failed, skipped, coverage %.
- If any fail, diagnose and fix before completing.

---

## Output

```
## TEST RESULTS
- Unit: X passed, Y failed
- Integration: X passed, Y failed
- Coverage: XX%

## FILES CREATED/MODIFIED
- <list>

## HOW TO RUN
- <exact commands>

## CI STATUS
- <workflow file path or "not configured">
```

---

## Example Invocation

```
/test-suite backend/app/services/household 85% unit,integration github-actions
Seed data: 3 residences, 2 staff members, 5 vendor contracts per residence
```

# api-test

Generate API contract + integration tests from OpenAPI/GraphQL specs or live endpoints.

## Arguments

$ARGUMENTS

Parse the following from arguments:
- **spec_path_or_url**: path to OpenAPI/Swagger YAML/JSON, GraphQL schema, or base URL to discover endpoints
- **auth_mode**: `none`, `bearer`, `api-key`, `oauth2`, `session`
- **env**: target environment — `local`, `staging`, `production`
- **test_style**: `rest-client` (httpx/requests), `pytest`, `jest`, `supertest`, `playwright-api`
- **load_smoke**: (optional) `true` to include basic load/smoke tests (e.g., k6, artillery)

---

## Process

### 1. Parse Spec / Discover Endpoints
- If spec file: parse OpenAPI/Swagger or GraphQL schema.
- If URL: probe common paths (`/docs`, `/openapi.json`, `/graphql`) to discover the API surface.
- List all endpoints: method, path, auth requirement, request/response schemas.

### 2. Generate Test Cases
For each endpoint, generate:

**Success Cases**
- Valid request with all required fields → expected status + response shape.
- Valid request with optional fields → expected enriched response.

**Error Cases**
- Missing required fields → 400/422 with error detail.
- Invalid types / out-of-range values → 400/422.
- Unauthorized request → 401.
- Forbidden (wrong role) → 403.
- Not found (invalid ID) → 404.

**Edge Cases**
- Empty body, empty arrays, max-length strings, special characters.
- Pagination boundaries (page 0, page beyond last).
- Concurrent requests (if relevant).

### 3. Create Reusable Client / Helpers
- Base client with configurable base URL and auth.
- Helper functions: `create_test_user()`, `get_auth_token()`, `cleanup()`.
- Fixtures / factories for test data.

### 4. Environment CLI
- Tests accept `--env` flag or `TEST_ENV` env var to switch between local/staging/prod URLs.
- Auth credentials loaded from env vars (never hardcoded).

### 5. Load Smoke (if requested)
- Generate a basic load test script (k6 or artillery).
- Target: 50 concurrent users, 30-second duration, check < 500ms p95.

### 6. Run & Summarize
- Execute all generated tests.
- Report: endpoints covered, pass/fail, response times.

---

## Output

```
## API TEST RESULTS
- Endpoints discovered: X
- Test cases generated: X
- Passed: X | Failed: X | Skipped: X

## FILES CREATED
- tests/api/<resource>_test.py (or .test.ts)
- tests/api/conftest.py (or helpers.ts)
- tests/api/load_smoke.js (if load_smoke=true)

## HOW TO RUN
- All API tests: <command>
- Single resource: <command>
- Load smoke: <command>

## COVERAGE MAP
| Endpoint        | Method | Success | Error | Edge | Load |
|-----------------|--------|---------|-------|------|------|
| /api/v1/users   | GET    | ✅      | ✅    | ✅   | ✅   |
| /api/v1/users   | POST   | ✅      | ✅    | ⬜   | ⬜   |
```

---

## Example Invocation

```
/api-test backend/openapi.yaml bearer local pytest true
```

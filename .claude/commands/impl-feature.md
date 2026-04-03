# impl-feature

Plan and implement a complete feature end-to-end (design → code → tests → docs → demo) in its own branch.

## Arguments

$ARGUMENTS

Parse the following from arguments:
- **feature_name**: `<kebab-case short name>` — used for branch and doc naming
- **scope**: `<ui|api|fullstack|agent|infra>` — which layers are touched
- **acceptance_criteria**: bullet list or Gherkin-style text describing "done"
- **tech_constraints**: (optional) stack limits, required integrations
- **priority**: `<p0|p1|p2>` — urgency level
- **perf_targets**: (optional) latency, throughput, or resource goals
- **security_notes**: (optional) compliance or security requirements

---

## Process

### 1. Understand & Plan
- Summarize inputs in your own words.
- Write a **mini-PRD**: problem, users, success metrics, constraints, risks.
- Outline architecture: components, data model, API surface, sequence flows.
- Define acceptance tests derived from the criteria above.

### 2. Branch & Optional Worktree
- Create and checkout: `git checkout -b ai-feature/${feature_name}`
- If parallel work is beneficial, create a git worktree and work inside it. Explain commands.

### 3. Implementation
- Modify all necessary layers according to **scope**.
- Keep atomic **Conventional Commits** (`feat:`, `fix:`, `refactor:`, etc.).
- Prefer small, well-named modules with clear boundaries.

### 4. Tests
- Create or extend unit + integration tests.
- Ensure the test command passes. Provide the exact command.

### 5. Verification
- Build and run the app locally.
- Perform smoke tests. Write a short demo script (commands + URLs).

### 6. Docs
- Update `README.md` with new feature info.
- Add `docs/${feature_name}.md` (overview, architecture, endpoints, env vars).
- Add a CHANGELOG entry.

### 7. Deliverables
Produce a summary block:

```
## IMPLEMENTED
- <list of changes>

## TESTED
- <test results and commands>

## HOW TO RUN
- <exact commands and URLs>

## TRADEOFFS & FOLLOW-UPS
- <known limitations, future work>
```

---

## Error Handling
- On failures: show logs, propose fixes, and retry.
- For missing info: make clearly labeled `ASSUMPTION`s and explain how to change them later.

---

## Example Invocation

```
/impl-feature household-dashboard fullstack
Acceptance criteria:
- Given a logged-in principal, when they open /dashboard, they see all residences, upcoming tasks, and active vendor contracts
- Given a staff member, they see only their assigned residence
- Dashboard loads in < 2s on 3G
Tech constraints: Next.js frontend, FastAPI backend, PostgreSQL
Priority: p0
Perf targets: < 200ms API response, < 2s FCP
Security: row-level access control, no PII in logs
```

# code-review

Structured, example-driven code review for architecture, correctness, security, performance, and maintainability.

## Arguments

$ARGUMENTS

Parse the following from arguments:
- **paths**: file or directory paths to review (comma-separated)
- **style_examples**: (optional) exemplary files to learn style/conventions from before reviewing
- **severity_threshold**: `critical`, `high`, `medium`, `low` — only report issues at or above this level

---

## Process

### 1. Learn Style (if style_examples provided)
- Read the example files first.
- Identify core design principles, coding style, naming conventions, patterns.
- Use these as the baseline for the review.

### 2. Review Against Checklist

For each file in **paths**, evaluate:

**Architecture & Design**
- [ ] Single responsibility — does each module/function do one thing?
- [ ] Clear boundaries — are concerns separated?
- [ ] Dependency direction — do dependencies flow correctly?
- [ ] Appropriate abstractions — not over- or under-engineered?

**Correctness**
- [ ] Logic errors, off-by-one, null/undefined handling
- [ ] Error handling — are failures caught and communicated?
- [ ] Edge cases — empty inputs, large inputs, concurrent access

**Security**
- [ ] Input validation at system boundaries
- [ ] No secrets or PII in code/logs
- [ ] SQL injection, XSS, CSRF protection
- [ ] Auth/authz checks on protected routes
- [ ] Dependency vulnerabilities (known CVEs)

**Performance**
- [ ] N+1 queries, unnecessary re-renders, blocking I/O
- [ ] Appropriate caching, pagination, lazy loading
- [ ] Resource cleanup (connections, file handles, listeners)

**Maintainability**
- [ ] Clear naming (variables, functions, files)
- [ ] Reasonable file size (< 300 lines preferred)
- [ ] Test coverage for critical paths
- [ ] No dead code, commented-out blocks, or TODOs without tickets

### 3. Produce Issues

For each issue found:
```
### [SEVERITY] Issue Title
- **File**: path/to/file.ts:L42
- **Category**: security | correctness | performance | design | maintainability
- **Description**: What's wrong and why it matters.
- **Suggested Fix**:
  ```diff
  - old code
  + new code
  ```
```

### 4. Summary

```
## REVIEW SUMMARY
- Files reviewed: X
- Issues found: X critical, X high, X medium, X low
- Top concern: <one sentence>

## ISSUES BY SEVERITY
### Critical
- ...
### High
- ...

## READY-TO-PASTE PR COMMENT
<formatted markdown suitable for GitHub PR comment>
```

---

## Example Invocation

```
/code-review backend/app/services/,frontend/src/components/Dashboard.tsx
Style examples: backend/app/services/auth.py,frontend/src/components/Layout.tsx
Severity: medium
```

# API Versioning Strategy

## Current Version

- **v1** — released 2026-04-01
- Base URL: `/api/v1/`

## Versioning Approach

ChamberForge uses **URL-based versioning** for major API changes:

| Version | Base Path   | Status  |
|---------|-------------|---------|
| v1      | `/api/v1/`  | Current |
| v2      | `/api/v2/`  | Planned |

Clients may also send the `X-Api-Version` header (date-based, e.g. `2026-04-01`) to pin behaviour within a major version.

## Deprecation Policy

1. Deprecated endpoints receive a **6-month notice** before removal.
2. Responses from deprecated endpoints include the `X-Deprecated` header with the removal date.
3. OpenAPI docs are annotated with a deprecation warning and the recommended alternative.
4. After the removal date the endpoint returns `410 Gone`.

## Breaking vs Non-Breaking Changes

### Breaking (requires new major version)

- Removing a response field
- Changing the type of an existing field
- Removing an endpoint
- Renaming a required request parameter
- Changing authentication requirements

### Non-Breaking (safe within current version)

- Adding a new optional request field
- Adding a new response field
- Adding a new endpoint
- Adding a new enum value
- Relaxing a validation constraint

## Migration Guide Template: v1 to v2

When v2 is released, follow this checklist:

1. **Read the changelog** — review all breaking changes listed in the v2 release notes.
2. **Update base URL** — change `/api/v1/` to `/api/v2/` in your client configuration.
3. **Update request payloads** — adjust renamed or restructured fields per the changelog.
4. **Update response parsing** — handle removed fields and type changes.
5. **Set `X-Api-Version` header** — send the v2 release date (e.g. `2027-xx-xx`).
6. **Run integration tests** — verify all flows against the v2 sandbox.
7. **Remove v1 workarounds** — delete any compatibility shims once v2 is confirmed working.
8. **Monitor deprecation headers** — watch for `X-Deprecated` on any v2 endpoints you use.

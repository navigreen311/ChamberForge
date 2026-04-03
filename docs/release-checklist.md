# Release Checklist — ChamberForge v1.0.0

## Pre-Release
- [ ] All backend tests pass (`make test`)
- [ ] Frontend builds clean (`cd frontend && npm run build`)
- [ ] Smoke test passes (`make smoke-test`)
- [ ] Security scan clean (`make security-test`)
- [ ] CHANGELOG updated
- [ ] README version badge updated
- [ ] API docs reviewed
- [ ] SOC2 checklist reviewed

## Deployment
- [ ] Tag release: `git tag -a v1.0.0 -m "ChamberForge v1.0.0"`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Deploy to staging: `bash scripts/deploy-aws.sh staging v1.0.0`
- [ ] Run staging smoke test
- [ ] Deploy to production: `bash scripts/deploy-aws.sh production v1.0.0`
- [ ] Run production smoke test
- [ ] Verify health endpoints
- [ ] Monitor error rates for 1 hour

## Post-Release
- [ ] Create GitHub release with notes
- [ ] Notify team
- [ ] Monitor Datadog dashboards
- [ ] Check Sentry for new errors

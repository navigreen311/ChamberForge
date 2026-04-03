# deploy-prod

Prepare production deployment assets and a repeatable pipeline.

## Arguments

$ARGUMENTS

Parse the following from arguments:
- **platform**: `aws`, `gcp`, `azure`, `vercel`, `railway`, `fly.io`, `docker-compose`
- **region**: target deployment region (e.g., `us-east-1`, `eu-west-1`)
- **runtime**: `node`, `python`, `docker`, `serverless`
- **database**: `postgresql`, `mysql`, `mongodb`, `supabase`, `planetscale`
- **secrets_source**: `env-file`, `aws-ssm`, `vault`, `doppler`, `vercel-env`
- **zero_downtime**: `true` or `false`

---

## Process

### 1. Architecture Diagram
- Draw a deployment architecture (Mermaid or ASCII) showing: load balancer, app servers, database, cache, CDN, monitoring.

### 2. Infrastructure Configuration
- Generate IaC or platform config files:
  - Dockerfile / docker-compose (if Docker-based)
  - Terraform / Pulumi / CDK (if IaC)
  - Platform config: `fly.toml`, `vercel.json`, `railway.toml`, `render.yaml`
- Include environment variable templates with `YOUR_*_HERE` placeholders.

### 3. Build & Release Scripts
- Create build script: lint → test → build → package.
- Create release script: tag version → build image → push to registry.
- Wire into `Makefile` or `package.json` scripts.

### 4. CI/CD Pipeline
- Generate workflow file (GitHub Actions, GitLab CI, etc.):
  - On push to `main`: test → build → deploy to staging.
  - On tag `v*`: deploy to production.
- Include rollback step or instructions.

### 5. Rollout Strategy
- If **zero_downtime** is true: blue-green or rolling deployment.
- Database migration strategy (forward-only migrations, rollback plan).
- Health check endpoints and readiness probes.

### 6. Observability
- Logging: structured JSON logs, log aggregation setup.
- Metrics: key application and infrastructure metrics.
- Alerting: critical alerts (error rate, latency, disk, memory).

### 7. Staging Deploy & Smoke Test
- Provide commands to deploy to a staging environment.
- List smoke test checks (health endpoint, login flow, core feature).

---

## Output

```
## DEPLOYMENT ARCHITECTURE
- <Mermaid diagram or description>

## FILES CREATED
- <list of infra/config/workflow files>

## HOW TO DEPLOY
- Staging: <commands>
- Production: <commands>
- Rollback: <commands>

## ENVIRONMENT VARIABLES
- <list with placeholders>

## MONITORING
- Health: <endpoint>
- Logs: <location/service>
- Alerts: <what triggers them>
```

Full documentation written to `docs/deploy.md`.

---

## Example Invocation

```
/deploy-prod aws us-east-1 docker postgresql aws-ssm true
```

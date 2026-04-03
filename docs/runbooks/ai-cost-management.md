# AI Cost Management Runbook

## Monitoring AI Costs

### Dashboard
- Navigate to `/admin/monitoring` to see AI usage summary
- The dashboard shows total calls, total cost, and 24-hour breakdowns
- Alerts fire when 24h AI cost exceeds the budget threshold ($50/day default)

### API
```bash
# Quick cost check
curl -s http://localhost:8000/api/v1/metrics/detailed | python -m json.tool | grep -A5 ai_usage

# Check for active cost alerts
curl -s http://localhost:8000/api/v1/metrics/detailed | python -m json.tool | grep -A3 ai_cost
```

### Database Queries
```sql
-- Cost by day (last 7 days)
SELECT DATE(created_at) as day,
       COUNT(*) as calls,
       ROUND(SUM(cost_usd)::numeric, 4) as total_cost,
       ROUND(AVG(cost_usd)::numeric, 6) as avg_cost_per_call
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Cost by model
SELECT model,
       COUNT(*) as calls,
       ROUND(SUM(cost_usd)::numeric, 4) as total_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY model
ORDER BY total_cost DESC;

-- Top cost users (last 24h)
SELECT user_id,
       COUNT(*) as calls,
       ROUND(SUM(cost_usd)::numeric, 4) as total_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY total_cost DESC
LIMIT 20;

-- Cost by agent type
SELECT agent_type,
       COUNT(*) as calls,
       ROUND(SUM(cost_usd)::numeric, 4) as total_cost,
       ROUND(AVG(cost_usd)::numeric, 6) as avg_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY agent_type
ORDER BY total_cost DESC;
```

## Setting Budgets

### Alert Threshold
The alert threshold is configured in `backend/app/services/backbone/system_health.py`:
```python
AI_DAILY_COST_BUDGET = 50.0  # USD per day
```

Adjust as needed. The monitoring dashboard will show a warning alert when the 24-hour cost exceeds this value.

### Per-User Limits
Configure in the entitlements service to limit AI calls per user per day:
- Free tier: 10 AI calls/day
- Pro tier: 100 AI calls/day
- Enterprise: unlimited (but monitored)

## Cost Optimization Strategies

### 1. Model Selection
- Use cheaper models for simple tasks (classification, extraction)
- Reserve expensive models (GPT-4, Claude Opus) for complex reasoning
- Configure model routing in `backend/app/services/backbone/ai_runtime.py`

### 2. Prompt Optimization
- Keep prompts concise -- remove redundant instructions
- Use system prompts efficiently (cached by most providers)
- Batch similar requests when possible
- Cache common AI responses in Redis (TTL-based)

### 3. Token Management
- Set `max_tokens` limits appropriate to each task
- Truncate input context to only relevant information
- Use summarization for long documents before processing

### 4. Caching
```python
# Example: cache AI responses for identical inputs
# Configured in ai_runtime.py
CACHE_TTL_SECONDS = 3600  # 1 hour for stable queries
```

### 5. Rate Limiting
- Implement per-user rate limits via entitlements
- Add circuit breakers for runaway AI calls
- Monitor for infinite loops in agent orchestration

## Emergency Cost Control

If AI costs spike unexpectedly:

### 1. Identify the Source
```sql
-- Find recent high-cost calls
SELECT id, user_id, agent_type, model, cost_usd, created_at
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY cost_usd DESC
LIMIT 20;
```

### 2. Temporary Disable
```bash
# Set environment variable to disable AI features
# In production, update ECS task definition or SSM parameter
AI_ENABLED=false

# Or set a very low budget to effectively throttle
AI_DAILY_COST_BUDGET=1.0
```

### 3. Block Specific Users
If a single user is responsible:
```sql
-- Temporarily disable AI for a user (via entitlements)
UPDATE user_entitlements
SET ai_calls_remaining = 0
WHERE user_id = 'problematic-user-id';
```

### 4. Review and Fix
- Check for prompt injection or abuse
- Review agent orchestration for infinite loops
- Check for misconfigured retry logic
- Verify model selection is correct for each agent type

## Monthly Cost Review Checklist
1. Pull 30-day cost report by model and agent type
2. Compare against previous month
3. Identify top 5 cost drivers
4. Review if cheaper models can replace current ones
5. Check cache hit rates -- increase TTL if appropriate
6. Review per-user consumption patterns
7. Update budget thresholds if needed
8. Document findings and action items

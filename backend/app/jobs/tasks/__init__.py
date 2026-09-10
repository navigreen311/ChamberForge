"""Task modules for Celery autodiscovery.

**Every task module must be listed here.** Celery registers a task when the
module defining it is imported; this package's import list is what causes
that to happen in a worker process.

P-08 found two modules missing, and one of them mattered a great deal:

  - `retention_tasks` was **absent**, while `retention_cleanup` sat in the
    Beat schedule. So the weekly retention sweep - the deletion-adjacent job
    that enforces retention policy and honours legal holds, and the one job
    in this package that was already fully implemented - was scheduled
    against a task no worker had registered. Beat would dispatch it, the
    worker would log an unregistered-task error, and the sweep would never
    run. Nothing else would surface;
  - `drip_tasks` was absent too, though nothing schedules it today.

That failure mode is silent by construction, which is why
`tests/test_celery_tasks.py::TestTaskRegistry` now asserts that every task
named in `BEAT_SCHEDULE` is registered after importing this package.
"""
from app.jobs.tasks import (  # noqa: F401
    ai_tasks,
    backup_tasks,
    drip_tasks,
    evidence_tasks,
    notification_tasks,
    report_tasks,
    retention_tasks,
    search_tasks,
    sweep_tasks,
)

"""Celery Beat schedule definitions for ChamberForge.

P-08 owns this file. Two things changed.

**`args: ("all",)` is gone.** Four entries passed the string `"all"` to tasks
whose first parameter is `workspace_id`, so every scheduled run asked for the
workspace literally named `"all"`. While the tasks had `pass` bodies that
made no difference; the moment they became real, each nightly sweep would
have processed nothing and reported a clean run. The schedule now calls
sweep tasks that enumerate workspaces themselves.

**`daily_brief` is not scheduled.** It pointed at
`ai_tasks.run_command_ai_synthesis`, which is blocked under D4 - the brief
has no home a worker may write. A job that cannot do its work should not fire
at 06:00 every morning and log that it did. It returns to this schedule when
the cross-stack write question is settled; the entry is left here, commented,
so the gap is visible rather than forgotten.

Every task name below is asserted to exist by
`tests/test_jobs.py::test_beat_references_only_real_tasks`. A schedule
pointing at a task that has been renamed fails silently in production: Celery
logs an unregistered-task error on the worker and Beat carries on scheduling
it forever.
"""
from celery.schedules import crontab

BEAT_SCHEDULE = {
    # -- Evidence upkeep ---------------------------------------------------
    "evidence_refresh": {
        "task": "app.jobs.tasks.sweep_tasks.sweep_recency_refresh",
        "schedule": crontab(hour=2, minute=0, day_of_week="sunday"),
    },
    "stale_source_check": {
        "task": "app.jobs.tasks.sweep_tasks.sweep_stale_sources",
        "schedule": crontab(hour=0, minute=0),
    },
    # -- Operator communications -------------------------------------------
    "weekly_digest": {
        "task": "app.jobs.tasks.sweep_tasks.sweep_weekly_digest",
        "schedule": crontab(hour=8, minute=0, day_of_week="monday"),
        "options": {"queue": "notifications"},
    },
    # -- Compliance and durability -----------------------------------------
    #
    # Unchanged by P-08. `run_retention_cleanup` was already real, already
    # enumerates its own workspaces, and already honours legal holds; the
    # backup tasks are likewise implemented. Deliberately left alone.
    "retention_cleanup": {
        "task": "app.jobs.tasks.retention_tasks.run_retention_cleanup",
        "schedule": crontab(hour=3, minute=0, day_of_week="sunday"),
    },
    "daily_backup": {
        "task": "app.jobs.tasks.backup_tasks.automated_db_backup",
        "schedule": crontab(hour=2, minute=0),
    },
    "weekly_backup_verify": {
        "task": "app.jobs.tasks.backup_tasks.verify_backup_integrity",
        "schedule": crontab(hour=4, minute=0, day_of_week="sunday"),
        "args": ("backups/database/latest",),
    },
}

# -- Not scheduled, and why --------------------------------------------------
#
# "daily_brief": {
#     "task": "app.jobs.tasks.ai_tasks.run_command_ai_synthesis",
#     "schedule": crontab(hour=6, minute=0),
#     "options": {"queue": "ai"},
# },
#
# Blocked under D4: the daily brief reaches an operator through a Prisma
# `Notification`, which a Celery worker cannot write. Restore this entry when
# a sanctioned cross-stack write exists, as `ExportJob` already has.

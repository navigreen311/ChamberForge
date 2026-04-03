#!/bin/bash
cd backend
celery -A app.jobs.worker.celery worker --loglevel=info --concurrency=4 -Q default,ai,notifications

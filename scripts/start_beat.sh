#!/bin/bash
cd backend
celery -A app.jobs.worker.celery beat --loglevel=info

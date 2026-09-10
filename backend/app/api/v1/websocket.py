"""WebSocket API - self-hosted realtime fallback.

P-00 STUB. This file exists only so that main.py can register the router
up front and P-12 can fill it in without ever opening main.py. It declares
no routes and changes no behaviour.

OWNER: P-12 (Realtime - Pusher events & self-hosted fallback).
Everyone else: do not touch.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/ws", tags=["realtime"])

# P-12 fills this in. Intentionally empty: an APIRouter with no routes is a
# no-op at registration, so main.py can be frozen before the work exists.

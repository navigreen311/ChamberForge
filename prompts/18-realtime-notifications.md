# Prompt 18: Realtime Notifications & WebSocket Layer
Branch: ai-feature/realtime-notifications

## Mission
Build the realtime notification system using Pusher/WebSockets for live alerts, collaborative workspaces, crisis console, and system-wide event broadcasting.

## What to Build

### Backend
1. **services/backbone/realtime.py** — RealtimeService:
   - broadcast_to_workspace(workspace_id, channel, event, data) — send event to all workspace members
   - broadcast_to_user(user_id, event, data) — send to specific user
   - broadcast_crisis(workspace_id, incident_data) — high-priority crisis broadcast
   - get_presence(workspace_id) — who is online in workspace
2. **services/backbone/notifications.py** — NotificationService:
   - create_notification(user_id, type, title, body, action_url, priority) — persist notification
   - get_unread(user_id) → list[Notification]
   - mark_read(notification_id)
   - mark_all_read(user_id)
   - get_notification_preferences(user_id) → NotificationPreferences
   - update_preferences(user_id, prefs)
3. **models/notification.py** — Notification model: id, user_id, workspace_id, type (info/warning/critical/crisis), title, body, action_url, read, created_at
4. **api/v1/notifications.py** — CRUD + mark read + preferences
5. **api/v1/websocket.py** — WebSocket connection endpoint for real-time event streaming
6. **jobs/notification_dispatcher.py** — Dispatches notifications via: in-app (Pusher), email (Resend), or both based on preferences and priority

### Frontend
1. **components/layout/NotificationBell.tsx** — Bell icon with unread count badge, dropdown list of recent notifications
2. **components/layout/NotificationToast.tsx** — Toast popup for real-time notifications
3. **hooks/useRealtime.ts** — Hook for subscribing to Pusher channels, handling events
4. **hooks/useNotifications.ts** — Hook for notification CRUD and real-time updates
5. **app/notifications/page.tsx** — Full notifications page with filters (all/unread/critical)
6. **lib/pusher.ts** — Pusher client configuration

## Tests
- test notification creation and retrieval
- test mark read/unread logic
- test notification preferences filtering
- test realtime broadcast (mocked Pusher)

## Commit
feat: add realtime notifications — Pusher WebSockets, notification center, crisis broadcasts, email dispatch

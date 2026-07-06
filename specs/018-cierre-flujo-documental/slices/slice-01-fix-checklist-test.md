# Slice 01 — Fix Header Notifications Tests

**Status:** ✅ COMPLETED (commit `20414e6`)
**Date:** 2026-07-06

## Issue
2 failing tests in `header-notifications.test.tsx`:
1. Expected `getSpy` to be called with `/notifications?limit=20` — component now calls `/notifications` and `/notifications/unread-count`
2. Expected query key `["notifications"]` — actual key is `["notifications", "list"]`

## Root Cause
- Module-level mock (`vi.mock`) replaced `apiClient` with only `{ post: vi.fn() }` — missing `get`, `patch`, `put`, `delete`
- Mock response returned OLD API shape `{ notifications: [], unreadCount: 0 }` (object), but `useNotifications()` now returns `Notification[]` array
- `(notificationList ?? []).map(...)` failed because notificationList was an object, not an array

## Fix
- Added full apiClient mock with all HTTP methods
- Updated mock response to return `[]` (array) matching current Notification[] return type
- Updated assertion from `/notifications?limit=20` to `/notifications`
- Updated query key from `["notifications"]` to `["notifications", "list"]`

## Tests
- `npm run test -w frontend`: 260/260 passing (64/64 files)
- `npm run typecheck`: PASS
- `npm run lint`: PASS (1 pre-existing warning)
- `npm run build`: PASS

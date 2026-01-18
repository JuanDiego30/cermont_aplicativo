# Alertas Module

## Description

Automatic alerts system for order status changes, deadlines, and notifications.

## Features

- Order status change alerts
- Deadline reminders
- Priority-based notifications
- Alert resolution tracking

## Endpoints

| Method | Path                    | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/alertas`              | List all alerts   |
| GET    | `/alertas/:id`          | Get alert details |
| PATCH  | `/alertas/:id/resolver` | Resolve alert     |

## Dependencies

- `PrismaService`
- `EventEmitter`

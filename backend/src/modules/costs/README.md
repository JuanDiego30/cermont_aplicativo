# Costos Module

## Description
Cost tracking and management for orders: estimated vs actual costs.

## Features
- Cost item creation
- Cost comparison
- Budget tracking
- Margin calculations

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/costos/orden/:id` | Get costs by order |
| POST | `/costos` | Add cost |
| PATCH | `/costos/:id` | Update cost |
| GET | `/costos/comparativa/:ordenId` | Cost comparison |

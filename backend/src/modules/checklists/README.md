# Checklists Module

## Description
Checklist management for quality control during order execution.

## Features
- Template-based checklists
- Item completion tracking
- Conformance statistics
- Offline sync support

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/checklists/ejecucion/:id` | Get checklists by execution |
| POST | `/checklists` | Create checklist |
| PATCH | `/checklists/items/:id` | Update item |
| GET | `/checklists/templates` | List templates |

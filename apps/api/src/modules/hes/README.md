# HES Module

## Description
Health, Environment, and Safety (HES) equipment management and inspections.

## Features
- Equipment registration
- Safety inspections
- Compliance tracking
- Order association

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hes/equipos` | List HES equipment |
| POST | `/hes/equipos` | Register equipment |
| POST | `/hes/inspecciones` | Create inspection |
| GET | `/hes/orden/:id` | Get HES by order |

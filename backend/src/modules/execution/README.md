# Ejecución Module

## Description

Order execution management and task tracking.

## Features

- Execution creation and tracking
- Progress percentage calculation
- GPS location logging
- Task management

## Endpoints

| Method | Path                       | Description            |
| ------ | -------------------------- | ---------------------- |
| GET    | `/ejecucion/orden/:id`     | Get execution by order |
| POST   | `/ejecucion`               | Create execution       |
| PATCH  | `/ejecucion/:id/iniciar`   | Start execution        |
| PATCH  | `/ejecucion/:id/finalizar` | Complete execution     |

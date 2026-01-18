# Planeación Module

## Description

Order planning and scheduling management.

## Features

- Planning creation
- Kit association
- Approval workflow
- Schedule management

## Endpoints

| Method | Path                       | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/planeacion/orden/:id`    | Get planning by order |
| POST   | `/planeacion`              | Create planning       |
| PATCH  | `/planeacion/:id/aprobar`  | Approve planning      |
| PATCH  | `/planeacion/:id/rechazar` | Reject planning       |

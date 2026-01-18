# Cierre Administrativo Module

## Description

Administrative closing process for orders: Actas, SES, and Invoices management.

## Features

- Acta (completion certificate) generation
- SES (Service Entry Sheet) tracking
- Invoice management
- Closing progress tracking

## Endpoints

| Method | Path                               | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/cierre-administrativo/orden/:id` | Get closing status |
| POST   | `/cierre-administrativo/acta`      | Create acta        |
| POST   | `/cierre-administrativo/ses`       | Create SES         |
| POST   | `/cierre-administrativo/factura`   | Create invoice     |

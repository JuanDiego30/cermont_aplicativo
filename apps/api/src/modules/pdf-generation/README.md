# PDF Generation Module

## Description
PDF report and document generation service.

## Features
- Order reports
- Execution reports
- Checklist reports
- Custom templates (Handlebars)

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/pdf/orden/:id` | Generate order PDF |
| GET | `/pdf/ejecucion/:id` | Generate execution PDF |
| GET | `/pdf/checklist/:id` | Generate checklist PDF |

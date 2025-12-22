# Evidencias Module

## Description
Evidence file management for order execution (photos, videos, documents).

## Features
- Secure file upload
- MIME type validation
- File type deep scanning
- Tag-based organization

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/evidencias/orden/:id` | Get evidence by order |
| POST | `/evidencias/upload` | Upload evidence |
| DELETE | `/evidencias/:id` | Delete evidence |

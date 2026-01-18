# Evidence Module

## Description

Evidence file management for order execution (photos, videos, documents).

## Features

- Secure file upload
- MIME type validation
- File type deep scanning
- Tag-based organization

## Endpoints

| Method | Path                  | Description           |
| ------ | --------------------- | --------------------- |
| GET    | `/evidence/order/:id` | Get evidence by order |
| POST   | `/evidence/upload`    | Upload evidence       |
| DELETE | `/evidence/:id`       | Delete evidence       |

# Runbook: Email Delivery Troubleshooting

## Overview
System sends password reset and notification emails via EmailGateway.

## Check Env Vars
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Verify Connection
Check backend logs for "email" level messages:
```bash
pm2 logs cermont-backend --lines 50 | grep -i "email\|nodemailer\|smtp"
```

## Common Issues
| Issue | Symptom | Fix |
|---|---|---|
| SMTP connection refused | `connect ECONNREFUSED` | Verify SMTP host/port, firewall rules |
| Authentication failed | `535 Authentication failed` | Check SMTP_USER/SMTP_PASS credentials |
| Rate limited | `450 4.7.0` or `421 4.7.0` | Reduce volume or switch to dedicated service |

## Test
Use forgot-password endpoint and check mailtrap/sandbox:
```bash
curl -s -X POST https://<domain>/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Error Codes
| Code | Meaning |
|---|---|
| `EMAIL_SEND_FAILED` | Generic send failure |
| `SMTP_CONNECTION_ERROR` | Cannot reach SMTP server |
| `RATE_LIMITED` | SMTP provider rate limit hit |

## Escalation
If SMTP is down, check mail server status and credentials. Rotate SMTP_PASS if compromised.

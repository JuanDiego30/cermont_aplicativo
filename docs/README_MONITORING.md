# README – Monitoring & Observability

**Version:** 1.0.0  
**Date:** October 20, 2025  
**Status:** Stable

---

## Table of Contents

1. [Health Checks](#health-checks)
2. [Log Management](#log-management)
3. [PM2 Monitoring](#pm2-monitoring)
4. [Uptime Monitoring](#uptime-monitoring)
5. [Alerting](#alerting)
6. [Performance Metrics](#performance-metrics)
7. [Debugging](#debugging)

---

## Health Checks

### Basic Health Endpoint

**URL:** `GET /v1/health`

Check if the application is running:

```bash
curl https://your-domain.com/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T15:30:00.000Z"
}
```

### Version & Commit Endpoint

**URL:** `GET /v1/health/version`

Get application version and current commit hash:

```bash
curl https://your-domain.com/v1/health/version
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "commit": "abc123d",
  "date": "2025-10-20T15:30:00.000Z"
}
```

This is useful for:
- Verifying correct version deployed
- Debugging deployment issues
- Integration with monitoring systems

---

## Log Management

### Log Locations

**PM2 Logs:**
```
/var/log/pm2/cermont-out.log      # Standard output
/var/log/pm2/cermont-error.log    # Error output
```

**systemd Logs:**
```
sudo journalctl -u cermont -f     # Follow logs in real-time
```

### View Logs

**With PM2:**
```bash
# View last 100 lines
pm2 logs cermont

# Show only errors
pm2 logs cermont --err

# Real-time follow
pm2 logs cermont -f
```

**With journalctl:**
```bash
# Last 50 lines
sudo journalctl -u cermont -n 50

# Follow in real-time
sudo journalctl -u cermont -f

# Last hour
sudo journalctl -u cermont --since "1 hour ago"

# Specific date range
sudo journalctl -u cermont --since "2025-10-20" --until "2025-10-21"
```

### Log Rotation

PM2 automatically rotates logs. Configure in `ecosystem.config.js`:

```javascript
{
  error_file: '/var/log/pm2/cermont-error.log',
  out_file: '/var/log/pm2/cermont-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
}
```

**Manual rotation:**
```bash
pm2 flush cermont  # Clear logs
pm2 reloadLogs     # Rotate logs
```

### Log Levels

Application supports log levels:

```env
LOG_LEVEL=info  # Options: fatal, error, warn, info, debug, trace, silent
```

In code:

```typescript
logger.info('User logged in');
logger.warn('High memory usage');
logger.error('Database connection failed', err);
logger.debug('Query executed', { query, duration });
```

---

## PM2 Monitoring

### Start Application with PM2

```bash
# Start from ecosystem config
pm2 start ecosystem.config.js

# Start specific app
pm2 start src/api/dist/server.js --name "cermont"

# Start with watch (auto-restart on changes)
pm2 start src/api/dist/server.js --name "cermont" --watch
```

### Monitoring Dashboard

**Real-time dashboard:**
```bash
pm2 monit
```

Shows:
- CPU usage
- Memory usage
- Restart count
- Process status

**List processes:**
```bash
pm2 list
```

**Get process details:**
```bash
pm2 info cermont
```

### Process Management

**Restart application:**
```bash
pm2 restart cermont
pm2 restart all
```

**Stop application:**
```bash
pm2 stop cermont
pm2 stop all
```

**Delete process:**
```bash
pm2 delete cermont
pm2 delete all
```

**Save PM2 state:**
```bash
pm2 save          # Save current processes
pm2 resurrect     # Restore on reboot
pm2 startup       # Enable auto-startup on system boot
```

---

## Uptime Monitoring

### External Monitoring Services

#### UptimeRobot

1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Create new monitor
3. Set URL: `https://your-domain.com/v1/health/version`
4. Set check interval: 5 minutes
5. Add alert contacts (email, Slack, Discord)

#### BetterStack

1. Go to [BetterStack.com](https://betterstack.com)
2. Create uptime monitor
3. Configure webhook alerts
4. Track uptime percentage

#### Datadog

1. Go to [Datadog.com](https://datadog.com)
2. Create synthetic test
3. Add HTTP endpoint test
4. Configure alerts

### Manual Health Check

```bash
#!/usr/bin/env bash
HEALTH=$(curl -s https://your-domain.com/v1/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "✅ Service healthy"
else
  echo "❌ Service down"
  # Trigger alert
fi
```

---

## Alerting

### Discord Notifications

Set environment variable:
```bash
export DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/..."
```

Send alert:
```bash
bash ops/scripts/notify.sh "⚠️  High CPU usage detected" discord
```

### Slack Notifications

Set environment variable:
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

Send alert:
```bash
bash ops/scripts/notify.sh "🔴 Database connection failed" slack
```

### Custom Alerts

Create alert script:

```bash
#!/usr/bin/env bash
# ops/scripts/alert-cpu.sh

CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
THRESHOLD=80

if (( $(echo "$CPU > $THRESHOLD" | bc -l) )); then
  bash ops/scripts/notify.sh "⚠️  CPU usage: ${CPU}%" discord
fi
```

Cron job:
```bash
# Run every 5 minutes
*/5 * * * * /home/deploy/ops/scripts/alert-cpu.sh
```

---

## Performance Metrics

### Response Time Tracking

Headers included in responses:

```
X-Response-Time: 45ms
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
```

Extract from logs:

```bash
# Find slow requests
grep "responseTime" /var/log/pm2/cermont-out.log | grep -v "ms:[0-5]"
```

### Resource Usage

Check memory:
```bash
# All processes
free -h

# Node process
ps aux | grep node | grep -v grep

# PM2
pm2 monit
```

Check disk:
```bash
df -h /var/www/cermont
```

### Database Performance

Check query performance:

```sql
-- Enable slow query logging
SET log_min_duration_statement = 1000;  -- Log queries > 1000ms

-- Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

---

## Debugging

### Enable Debug Logging

Temporary debug mode:

```bash
# Set log level to debug
export LOG_LEVEL=debug
pm2 restart cermont
```

### Common Issues

**High Memory Usage:**
```bash
# Find memory leaks
pm2 info cermont

# Restart service
pm2 restart cermont

# If persists, investigate code
NODE_OPTIONS=--inspect node src/api/dist/server.js
```

**Slow Response Times:**
```bash
# Check slow queries
tail -f /var/log/pm2/cermont-out.log | grep "duration"

# Check database connection
psql -U cermont_user -d cermont_db -c "SELECT 1;"
```

**Service Not Starting:**
```bash
# Check logs
pm2 logs cermont --err

# Check port availability
lsof -i :4000

# Verify environment variables
printenv | grep DATABASE_URL
```

### Request Tracing

Each request has unique ID:

```bash
# Find request in logs
grep "550e8400-e29b-41d4-a716-446655440000" /var/log/pm2/cermont-out.log
```

### Performance Profiling

```bash
# CPU profiling
node --prof src/api/dist/server.js

# Generate report
node --prof-process isolate-*.log > profile.txt
```

---

## Maintenance Tasks

### Daily

- Check uptime monitor alerts
- Review error logs for issues
- Monitor disk space

### Weekly

- Review slow query log
- Check backup status
- Update dependencies

### Monthly

- Analyze performance trends
- Capacity planning
- Security updates

---

## Useful Commands

```bash
# Full system health check
echo "=== Service Status ===" && sudo systemctl status cermont
echo "=== Process Info ===" && pm2 info cermont
echo "=== Database ===" && psql -U cermont_user -d cermont_db -c "SELECT 1;"
echo "=== Health Check ===" && curl -s https://your-domain.com/v1/health | jq

# Emergency restart
sudo systemctl restart cermont

# View real-time logs
sudo journalctl -u cermont -f

# Check resource usage
pm2 monit

# Save logs to file
pm2 logs cermont > cermont-logs-$(date +%Y%m%d).log
```

---

## See Also

- [API Reference](./README_API.md)
- [Deployment Guide](./README_DEPLOY.md)
- [Frontend Documentation](./README_FRONTEND.md)

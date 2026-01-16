# VPS Checkup (Manual)

> Checklist manual para revisión de VPS con Docker.

## Identidad y estado

- `whoami && hostname -f && date -Is && uptime`
- `id && groups`

## Sistema

- `cat /etc/os-release || true`
- `uname -a`
- `free -h`
- `df -hT`
- `lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,ROTA,MODEL`
- `systemctl --failed || true`
- `sudo journalctl -p 3 -xb --no-pager | tail -n 200`

## Seguridad

- `sudo sshd -T 2>/dev/null | egrep -i '^(port|permitrootlogin|passwordauthentication|kbdinteractiveauthentication|challengeresponseauthentication|pubkeyauthentication|authenticationmethods|allowusers|allowgroups|denyusers|denygroups|x11forwarding|allowtcpforwarding|permittty|loglevel) ' || true`
- `sudo ufw status verbose || true`
- `sudo fail2ban-client status || true`
- `sudo ss -tulpn || ss -tulpn`

## Docker

- `systemctl status docker --no-pager || true`
- `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.RunningFor}}'`
- `docker stats --no-stream`
- `docker system df`

## Riesgos (no ejecutar sin aprobación)

- `sudo apt upgrade` / `sudo apt full-upgrade`
- `docker system prune`
- reinicios de servicios críticos

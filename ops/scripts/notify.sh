#!/usr/bin/env bash

# Notification script for Discord/Slack
# Usage: ./ops/scripts/notify.sh "message" [webhook_type]
# Example: ./ops/scripts/notify.sh "⚠️  Cermont service down" discord

MESSAGE="${1:-Service alert from Cermont}"
WEBHOOK_TYPE="${2:-discord}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$WEBHOOK_TYPE" in
  discord)
    WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
    if [ -z "$WEBHOOK_URL" ]; then
      echo -e "${RED}❌ DISCORD_WEBHOOK_URL not set${NC}"
      exit 1
    fi

    # Discord embed message
    PAYLOAD=$(cat <<EOF
{
  "content": "$MESSAGE",
  "embeds": [
    {
      "title": "Cermont Alert",
      "description": "$MESSAGE",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "color": 15158332,
      "footer": {
        "text": "Cermont Monitoring"
      }
    }
  ]
}
EOF
    )

    RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD" \
      -w "\n%{http_code}" \
      -s)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    if [ "$HTTP_CODE" = "204" ]; then
      echo -e "${GREEN}✅ Discord notification sent${NC}"
    else
      echo -e "${RED}❌ Discord notification failed (HTTP $HTTP_CODE)${NC}"
      exit 1
    fi
    ;;

  slack)
    WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
    if [ -z "$WEBHOOK_URL" ]; then
      echo -e "${RED}❌ SLACK_WEBHOOK_URL not set${NC}"
      exit 1
    fi

    # Slack message
    PAYLOAD=$(cat <<EOF
{
  "text": "Cermont Alert",
  "attachments": [
    {
      "color": "danger",
      "text": "$MESSAGE",
      "ts": $(date +%s)
    }
  ]
}
EOF
    )

    RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD" \
      -w "\n%{http_code}" \
      -s)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✅ Slack notification sent${NC}"
    else
      echo -e "${RED}❌ Slack notification failed (HTTP $HTTP_CODE)${NC}"
      exit 1
    fi
    ;;

  *)
    echo -e "${RED}❌ Unknown webhook type: $WEBHOOK_TYPE${NC}"
    echo "Supported types: discord, slack"
    exit 1
    ;;
esac

exit 0

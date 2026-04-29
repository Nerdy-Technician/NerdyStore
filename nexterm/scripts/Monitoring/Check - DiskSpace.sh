#!/bin/bash

# @name:Check - DiskSpace
# @description:Check disk space usage
# @Category:Monitoring
# @Language:Bash
# @OS:Linux


THRESHOLD=80
ALERT_FILE="/tmp/disk-alerts.txt"

df -h | grep '^/dev/' | while read line; do
  USAGE=$(echo $line | awk '{print $5}' | tr -d '%')
  MOUNT=$(echo $line | awk '{print $6}')

  if [ "$USAGE" -ge "$THRESHOLD" ]; then
    echo "$(date): WARNING - $MOUNT at ${USAGE}%" >> $ALERT_FILE

  fi
done
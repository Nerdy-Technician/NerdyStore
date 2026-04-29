#!/usr/bin/env bash

# @name:Cron - ClamScan Entry
# @description:Manage ClamAV scan cron entry
# @Category:Crontab
# @Language:Bash
# @OS:Linux

# Cron - ClamScan Entry (from Check - ClamScan Crontab.sh)
if crontab -l 2>/dev/null | grep -q "clamscan"; then crontab -l | grep "clamscan"; else echo "No clamscan cron job found"; fi
exit 0
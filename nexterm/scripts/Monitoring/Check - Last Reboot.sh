#!/bin/bash

# @name:Check Last Reboot
# @description:Report last reboot time and uptime; alert if over 90 days
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking system uptime and last reboot"
uptime_seconds=$(awk '{print int($1)}' /proc/uptime)
uptime_days=$(( uptime_seconds / 86400 ))
uptime_hours=$(( (uptime_seconds % 86400) / 3600 ))
last_boot=$(who -b | awk '{print $3, $4}')

@NEXTERM:SUMMARY "System Uptime" "Last Reboot" "$last_boot" "Uptime" "${uptime_days}d ${uptime_hours}h"

if [ "$uptime_days" -gt 90 ]; then
    @NEXTERM:WARN "System has been up for ${uptime_days} days — consider scheduling a maintenance reboot"
else
    @NEXTERM:SUCCESS "Last reboot: $last_boot (${uptime_days} day(s) ago)"
fi

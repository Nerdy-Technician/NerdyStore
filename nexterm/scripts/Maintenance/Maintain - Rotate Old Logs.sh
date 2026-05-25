#!/bin/bash

# @name:Maintain Rotate Old Logs
# @description:Compress logs older than 7 days; remove compressed logs older than 30 days
# @Category:Maintenance
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Compressing log files older than 7 days"
find /var/log -type f -name "*.log" -mtime +7 ! -name "*.gz" -exec gzip -f {} \; 2>/dev/null
echo "Compression done"

@NEXTERM:STEP "Removing compressed logs older than 30 days"
deleted=$(find /var/log -type f -name "*.gz" -mtime +30 -print -delete 2>/dev/null)
count=$(echo "$deleted" | grep -c . || echo 0)
echo "Removed $count old compressed log(s)"

@NEXTERM:SUMMARY "Log Rotation" "Compressed" ">7 days old .log files" "Deleted" "$count files older than 30 days"

@NEXTERM:SUCCESS "Log rotation complete"

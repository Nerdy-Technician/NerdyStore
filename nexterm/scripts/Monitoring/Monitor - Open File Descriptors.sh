#!/bin/bash

# @name:Monitor Open File Descriptors
# @description:Check system-wide open FD usage against kernel limit
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking open file descriptor usage"
allocated=$(awk '{print $1}' /proc/sys/fs/file-nr)
max=$(awk '{print $3}' /proc/sys/fs/file-nr)
pct=$(( allocated * 100 / max ))

@NEXTERM:STEP "Top processes by open FD count"
ls /proc/*/fd 2>/dev/null | awk -F'/' '{print $3}' | sort | uniq -c | sort -rn | head -10 | while read count pid; do
    comm=$(cat /proc/$pid/comm 2>/dev/null || echo "unknown")
    echo "  PID $pid ($comm): $count FDs"
done

@NEXTERM:SUMMARY "File Descriptors" "Open" "$allocated" "Max" "$max" "Usage" "${pct}%"

if [ "$pct" -ge 90 ]; then
    @NEXTERM:WARN "FD usage at ${pct}% — approaching system limit"
elif [ "$pct" -ge 75 ]; then
    @NEXTERM:WARN "FD usage at ${pct}% — monitor closely"
else
    @NEXTERM:SUCCESS "File descriptor usage at ${pct}% — within normal range"
fi

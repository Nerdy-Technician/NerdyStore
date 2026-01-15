#!/bin/bash
@NEXTERM:STEP "Checking log rotation configuration"

ISSUES=0

# Check logrotate service
@NEXTERM:STEP "Check logrotate timer"
if systemctl is-enabled logrotate.timer &>/dev/null; then
    @NEXTERM:INFO "Logrotate timer is enabled"
else
    @NEXTERM:WARN "Logrotate timer not enabled - using cron"
fi

# Find large log files
@NEXTERM:STEP "Scan for large log files"
LARGE_LOGS=$(find /var/log -type f -size +100M 2>/dev/null)

if [ ! -z "$LARGE_LOGS" ]; then
    @NEXTERM:WARN "Found log files larger than 100MB:"
    echo "$LARGE_LOGS" | while read LOG; do
        SIZE=$(du -h "$LOG" | awk '{print $1}')
        @NEXTERM:WARN "  $LOG ($SIZE)"
        ISSUES=$((ISSUES+1))
    done
else
    @NEXTERM:INFO "No unusually large log files found"
fi

# Check logrotate config syntax
@NEXTERM:STEP "Validate logrotate configuration"
if logrotate -d /etc/logrotate.conf &>/dev/null; then
    @NEXTERM:SUCCESS "Logrotate configuration is valid"
else
    @NEXTERM:ERROR "Logrotate configuration has errors"
    ISSUES=$((ISSUES+1))
fi

# Test rotation
@NEXTERM:CONFIRM "Run logrotate in debug mode to test configuration?"
logrotate -d /etc/logrotate.conf | tail -n 50

# Check rotation status
@NEXTERM:STEP "Check logrotate status"
if [ -f /var/lib/logrotate/status ]; then
    LAST_RUN=$(stat -c %y /var/lib/logrotate/status | cut -d' ' -f1)
    @NEXTERM:INFO "Last logrotate run: $LAST_RUN"
else
    @NEXTERM:WARN "Logrotate status file not found"
    ISSUES=$((ISSUES+1))
fi

@NEXTERM:SUMMARY "Log Rotation Check" "Large Logs (>100MB)" "$(echo $LARGE_LOGS | wc -w)" "Config Valid" "$(logrotate -d /etc/logrotate.conf &>/dev/null && echo 'Yes' || echo 'No')" "Issues Found" "$ISSUES"

if [ "$ISSUES" -eq 0 ]; then
    @NEXTERM:SUCCESS "Log rotation check passed"
else
    @NEXTERM:WARN "Found $ISSUES log rotation issues"
fi

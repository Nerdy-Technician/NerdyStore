#!/bin/bash
@NEXTERM:STEP "Running comprehensive security audit"

# UFW Status
@NEXTERM:STEP "Check firewall status"
UFW_STATUS=$(sudo ufw status | grep -i "Status: active" && echo "PASS" || echo "FAIL")

# Failed SSH attempts
@NEXTERM:STEP "Check failed SSH attempts"
FAILED_SSH=$(grep "Failed password" /var/log/auth.log 2>/dev/null | tail -n 10 | wc -l)
if [ "$FAILED_SSH" -gt 5 ]; then
    SSH_STATUS="WARN"
else
    SSH_STATUS="PASS"
fi

# Open ports
@NEXTERM:STEP "Check open ports"
OPEN_PORTS=$(sudo ss -tulpn | grep LISTEN | wc -l)

# Sudo sessions
@NEXTERM:STEP "Check recent sudo sessions"
SUDO_COUNT=$(grep -i "session opened" /var/log/auth.log 2>/dev/null | tail -n 24h | wc -l)

# Recent logins
@NEXTERM:STEP "Check recent logins"
RECENT_LOGINS=$(last -a | head -n 5)

# SUID files check
@NEXTERM:STEP "Scan for unusual SUID files"
UNUSUAL_SUID=$(find /usr/bin /usr/local/bin -perm -4000 2>/dev/null | grep -v -E '(sudo|su|passwd|mount|umount|ping)' | wc -l)
if [ "$UNUSUAL_SUID" -gt 5 ]; then
    SUID_STATUS="WARN"
else
    SUID_STATUS="PASS"
fi

@NEXTERM:SUMMARY "Security Audit Results" "UFW Status" "$UFW_STATUS" "Failed SSH (24h)" "$FAILED_SSH ($SSH_STATUS)" "Open Ports" "$OPEN_PORTS" "Sudo Sessions" "$SUDO_COUNT" "Unusual SUID" "$UNUSUAL_SUID ($SUID_STATUS)"

if [ "$UFW_STATUS" = "FAIL" ] || [ "$SSH_STATUS" = "WARN" ] || [ "$SUID_STATUS" = "WARN" ]; then
    @NEXTERM:WARN "Security audit found issues requiring attention"
else
    @NEXTERM:SUCCESS "Security audit completed - no critical issues"
fi

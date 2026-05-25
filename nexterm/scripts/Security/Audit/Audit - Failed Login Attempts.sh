#!/bin/bash

# @name:Audit Failed Login Attempts
# @description:Report failed SSH/login attempts from auth log
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Scanning auth log for failed login attempts"
log=""
for f in /var/log/auth.log /var/log/secure; do [ -f "$f" ] && log="$f" && break; done

if [ -z "$log" ]; then
    @NEXTERM:WARN "No auth log found"
    exit 1
fi

count=$(grep -c "Failed password\|Invalid user" "$log" 2>/dev/null || echo 0)
top_ips=$(grep "Failed password\|Invalid user" "$log" 2>/dev/null | grep -oP 'from \K[\d.]+' | sort | uniq -c | sort -rn | head -10)

@NEXTERM:STEP "Top source IPs with failed attempts"
echo "$top_ips"

@NEXTERM:SUMMARY "Failed Login Audit" "Total Failed Attempts" "$count" "Log File" "$log"

if [ "$count" -gt 50 ]; then
    @NEXTERM:WARN "High volume of failed logins ($count) — consider tightening fail2ban or firewall rules"
else
    @NEXTERM:SUCCESS "Failed login count: $count"
fi

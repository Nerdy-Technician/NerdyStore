#!/bin/bash

# @name:Audit SSH Config
# @description:Check sshd_config for common insecure settings
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Auditing SSH daemon configuration"
cfg="/etc/ssh/sshd_config"
root_login=$(grep -iE "^PermitRootLogin" "$cfg" 2>/dev/null | awk '{print $2}' || echo "not set")
pw_auth=$(grep -iE "^PasswordAuthentication" "$cfg" 2>/dev/null | awk '{print $2}' || echo "not set")
empty_pw=$(grep -iE "^PermitEmptyPasswords" "$cfg" 2>/dev/null | awk '{print $2}' || echo "not set")
x11=$(grep -iE "^X11Forwarding" "$cfg" 2>/dev/null | awk '{print $2}' || echo "not set")

@NEXTERM:SUMMARY "SSH Config Audit" "PermitRootLogin" "$root_login" "PasswordAuthentication" "$pw_auth" "PermitEmptyPasswords" "$empty_pw" "X11Forwarding" "$x11"

issues=0
[ "$root_login" = "yes" ] && echo "FAIL: PermitRootLogin is yes" && issues=$((issues+1))
[ "$pw_auth" = "yes" ] && echo "WARN: PasswordAuthentication is yes" && issues=$((issues+1))
[ "$empty_pw" = "yes" ] && echo "FAIL: PermitEmptyPasswords is yes" && issues=$((issues+1))

if [ "$issues" -gt 0 ]; then
    @NEXTERM:WARN "$issues SSH config issue(s) found — harden sshd_config"
else
    @NEXTERM:SUCCESS "SSH config looks secure"
fi

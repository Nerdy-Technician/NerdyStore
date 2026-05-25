#!/bin/bash

# @name:Audit Passwd Shadow Permissions
# @description:Verify /etc/passwd and /etc/shadow have correct permissions
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking permissions on critical auth files"
passwd_perms=$(stat -c "%a %U %G" /etc/passwd 2>/dev/null)
shadow_perms=$(stat -c "%a %U %G" /etc/shadow 2>/dev/null)
passwd_code=$(stat -c "%a" /etc/passwd 2>/dev/null)
shadow_code=$(stat -c "%a" /etc/shadow 2>/dev/null)

@NEXTERM:SUMMARY "Auth File Permissions" "/etc/passwd" "$passwd_perms" "/etc/shadow" "$shadow_perms"

issues=0
[ "$passwd_code" != "644" ] && echo "FAIL: /etc/passwd is $passwd_code (expected 644)" && issues=$((issues+1))
[ "$shadow_code" != "640" ] && [ "$shadow_code" != "000" ] && echo "FAIL: /etc/shadow is $shadow_code (expected 640)" && issues=$((issues+1))

if [ "$issues" -gt 0 ]; then
    @NEXTERM:WARN "Permission issues found on critical auth files"
else
    @NEXTERM:SUCCESS "Auth file permissions are correct"
fi

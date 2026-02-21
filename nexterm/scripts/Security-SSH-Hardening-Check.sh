#!/bin/bash

# @name:Security SSH Hardening Check
# @description:Validating SSH configuration
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Validating SSH configuration"

SSHD_CONFIG="/etc/ssh/sshd_config"
ISSUES=0

@NEXTERM:STEP "Check PermitRootLogin"
ROOT_LOGIN=$(grep -E "^PermitRootLogin" $SSHD_CONFIG | awk '{print $2}')
if [ "$ROOT_LOGIN" != "no" ]; then
    @NEXTERM:WARN "PermitRootLogin is not set to 'no' (currently: $ROOT_LOGIN)"
    ISSUES=$((ISSUES+1))
fi

@NEXTERM:STEP "Check PasswordAuthentication"
PASSWORD_AUTH=$(grep -E "^PasswordAuthentication" $SSHD_CONFIG | awk '{print $2}')
if [ "$PASSWORD_AUTH" != "no" ]; then
    @NEXTERM:WARN "PasswordAuthentication is not set to 'no' (currently: $PASSWORD_AUTH)"
    ISSUES=$((ISSUES+1))
fi

@NEXTERM:STEP "Check SSH port"
SSH_PORT=$(grep -E "^Port" $SSHD_CONFIG | awk '{print $2}')
if [ -z "$SSH_PORT" ] || [ "$SSH_PORT" = "22" ]; then
    @NEXTERM:INFO "SSH running on default port 22 - consider changing"
    ISSUES=$((ISSUES+1))
fi

@NEXTERM:STEP "Check PubkeyAuthentication"
PUBKEY_AUTH=$(grep -E "^PubkeyAuthentication" $SSHD_CONFIG | awk '{print $2}')
if [ "$PUBKEY_AUTH" != "yes" ]; then
    @NEXTERM:WARN "PubkeyAuthentication is not enabled"
    ISSUES=$((ISSUES+1))
fi

@NEXTERM:SUMMARY "SSH Hardening Check" "Root Login" "$ROOT_LOGIN" "Password Auth" "$PASSWORD_AUTH" "SSH Port" "${SSH_PORT:-22}" "Issues Found" "$ISSUES"

if [ "$ISSUES" -eq 0 ]; then
    @NEXTERM:SUCCESS "SSH configuration follows security best practices"
else
    @NEXTERM:ERROR "Found $ISSUES SSH security issues - review and fix"
fi

#!/usr/bin/env bash

# @name:Security - Firewall Status
# @description:Check firewall status
# @Category:Network
# @Language:Bash
# @OS:Linux

# Security - Firewall Status (from firewall-status.sh)
if command -v ufw >/dev/null 2>&1; then ufw status verbose; elif command -v firewall-cmd >/dev/null 2>&1; then firewall-cmd --state; firewall-cmd --list-all; else iptables -L -n -v; fi
exit 0
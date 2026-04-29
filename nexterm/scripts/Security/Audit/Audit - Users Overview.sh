#!/usr/bin/env bash

# @name:Audit - Users Overview
# @description:Audit user overview
# @Category:Security - Audit
# @Language:Bash
# @OS:Linux

# Audit - Users Overview (from Security_ Audit Users [LIN].sh)
echo "=== Users Overview ==="
awk -F: '{print $1":"$3":"$6}' /etc/passwd
exit 0
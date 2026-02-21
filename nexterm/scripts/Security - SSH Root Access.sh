#!/usr/bin/env bash
# Security - SSH Root Access (from SSH Root Access.sh)

# @name:Security SSH Root Access
# @description:Runs security ssh root access.
# @Language:Bash
# @OS:Linux

if grep -qi '^PermitRootLogin\s\+yes' /etc/ssh/sshd_config; then echo "WARNING: Root SSH login enabled"; exit 1; else echo "Root SSH login disabled"; exit 0; fi
#!/usr/bin/env bash

# @name:Security - SSH Root Access
# @description:Check SSH root access configuration
# @Category:Collector
# @Language:Bash
# @OS:Linux

# Security - SSH Root Access (from SSH Root Access.sh)
if grep -qi '^PermitRootLogin\s\+yes' /etc/ssh/sshd_config; then echo "WARNING: Root SSH login enabled"; exit 1; else echo "Root SSH login disabled"; exit 0; fi
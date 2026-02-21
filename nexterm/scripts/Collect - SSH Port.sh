#!/usr/bin/env bash
# Collect - SSH Port (from SSH Port Fetch.sh)

# @name:Collect SSH Port
# @description:Runs collect ssh port.
# @Language:Bash
# @OS:Linux

PORT=$(grep -oP '^Port\s+\K\d+' /etc/ssh/sshd_config || true); [ -z "$PORT" ] && PORT=22; echo "SSH Port: $PORT"; exit 0
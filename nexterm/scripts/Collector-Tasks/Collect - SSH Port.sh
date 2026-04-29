#!/usr/bin/env bash

# @name:Collect - SSH Port
# @description:Collect SSH port configuration
# @Category:Collector
# @Language:Bash
# @OS:Linux

# Collect - SSH Port (from SSH Port Fetch.sh)
PORT=$(grep -oP '^Port\s+\K\d+' /etc/ssh/sshd_config || true); [ -z "$PORT" ] && PORT=22; echo "SSH Port: $PORT"; exit 0
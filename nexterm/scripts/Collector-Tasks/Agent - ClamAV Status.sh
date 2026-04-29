#!/usr/bin/env bash

# @name:Agent - ClamAV Status
# @description:Check ClamAV antivirus service status
# @Category:Collector
# @Language:Bash
# @OS:Linux

# Agent - ClamAV Status (from ClamAV Check.sh)
if systemctl is-active --quiet clamav-daemon; then echo "ClamAV running"; exit 0; else echo "ClamAV not running"; exit 1; fi
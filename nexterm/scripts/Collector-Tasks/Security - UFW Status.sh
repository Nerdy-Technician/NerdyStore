#!/usr/bin/env bash

# @name:Security - UFW Status
# @description:Check UFW firewall status
# @Category:Collector
# @Language:Bash
# @OS:Linux

# Security - UFW Status (from UFW Status.sh)
if ufw status 2>/dev/null | grep -q "Status: active"; then echo "UFW active"; exit 0; else echo "UFW inactive"; exit 1; fi
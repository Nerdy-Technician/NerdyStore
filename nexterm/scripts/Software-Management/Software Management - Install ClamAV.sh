#!/usr/bin/env bash

# @name:Software Management - Install ClamAV
# @description:Install package
# @Category:Software Management
# @Language:Bash
# @OS:Linux

# Software Management - Install ClamAV (from Install ClamAV.sh)
if command -v clamscan >/dev/null 2>&1; then echo "ClamAV already installed"; exit 0; fi
apt update -y && apt install -y clamav && echo "ClamAV installed"; exit 0
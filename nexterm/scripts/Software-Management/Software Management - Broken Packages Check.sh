#!/usr/bin/env bash

# @name:Software Management - Broken Packages Check
# @description:Check for broken packages
# @Category:Software Management
# @Language:Bash
# @OS:Linux

# Software Management - Broken Packages Check (from check-broken-packages.sh)
command -v apt >/dev/null 2>&1 || { echo "Requires apt"; exit 1; }
apt-get check; dpkg --audit; exit 0
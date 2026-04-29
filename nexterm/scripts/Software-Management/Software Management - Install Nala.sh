#!/usr/bin/env bash

# @name:Software Management - Install Nala
# @description:Install package
# @Category:Software Management
# @Language:Bash
# @OS:Linux

# Software Management - Install Nala (from Install Nala.sh)
apt-get update -y && apt-get install -y nala && command -v nala >/dev/null 2>&1 && echo "Nala installed" || { echo "Nala install failed"; exit 1; }
exit 0
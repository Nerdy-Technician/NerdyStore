#!/usr/bin/env bash

# @name:Software Management - Nala Install Status
# @description:Check Nala package manager installation
# @Category:Collector
# @Language:Bash
# @OS:Linux

# Software Management - Nala Install Status (from Nala Install Status.sh)
if command -v nala >/dev/null 2>&1; then echo "Nala installed"; exit 0; else echo "Installing Nala"; apt-get install -y nala >/dev/null 2>&1; if command -v nala >/dev/null 2>&1; then echo "Nala installed (post-install)"; exit 66; else echo "Nala install failed"; exit 1; fi; fi
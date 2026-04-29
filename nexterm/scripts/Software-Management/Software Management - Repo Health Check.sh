#!/usr/bin/env bash

# @name:Software Management - Repo Health Check
# @description:Check package repository health
# @Category:Software Management
# @Language:Bash
# @OS:Linux

# Software Management - Repo Health Check (from repo-health-check.sh)
command -v apt >/dev/null 2>&1 || { echo "Requires apt"; exit 1; }
apt update -o Debug::Acquire::http=true 2>&1 | grep -E 'Err:|Hit:|Ign:'
exit 0
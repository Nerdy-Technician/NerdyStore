#!/bin/bash

# @name:Audit World Writable Files
# @description:Find world-writable files outside /proc and /sys
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Scanning for world-writable files (this may take a moment)"
count=$(find / -xdev -type f -perm -0002 \( ! -path "/proc/*" ! -path "/sys/*" \) 2>/dev/null | wc -l)
files=$(find / -xdev -type f -perm -0002 \( ! -path "/proc/*" ! -path "/sys/*" \) 2>/dev/null)

@NEXTERM:SUMMARY "World Writable File Scan" "Files Found" "$count"

if [ "$count" -gt 0 ]; then
    echo "$files"
    @NEXTERM:WARN "World-writable files detected — review and restrict permissions"
else
    @NEXTERM:SUCCESS "No world-writable files found"
fi

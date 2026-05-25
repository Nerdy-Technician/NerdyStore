#!/bin/bash

# @name:Maintain Trim SSD
# @description:Run fstrim on all mounted filesystems that support TRIM
# @Category:Maintenance
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking for fstrim availability"
if ! command -v fstrim &>/dev/null; then
    @NEXTERM:WARN "fstrim not available — install util-linux"
    exit 1
fi

@NEXTERM:STEP "Running fstrim on all supported filesystems"
fstrim --all --verbose 2>&1

@NEXTERM:SUCCESS "SSD TRIM complete"

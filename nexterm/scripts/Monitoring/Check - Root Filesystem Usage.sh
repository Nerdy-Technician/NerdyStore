#!/bin/bash

# @name:Check Root Filesystem Usage
# @description:Check / filesystem usage; alert at 90%, warn at 75%
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking root filesystem usage"
usage=$(df / | awk 'NR==2{print $5}' | tr -d '%')
avail=$(df -h / | awk 'NR==2{print $4}')
total=$(df -h / | awk 'NR==2{print $2}')

@NEXTERM:STEP "Filesystem details"
df -h /

@NEXTERM:SUMMARY "Root Filesystem" "Usage" "${usage}%" "Available" "$avail" "Total" "$total"

if [ "$usage" -ge 90 ]; then
    @NEXTERM:WARN "Root filesystem is ${usage}% full — immediate cleanup needed"
elif [ "$usage" -ge 75 ]; then
    @NEXTERM:WARN "Root filesystem is ${usage}% full — plan for cleanup"
else
    @NEXTERM:SUCCESS "Root filesystem usage at ${usage}% — OK"
fi

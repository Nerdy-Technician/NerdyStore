#!/bin/bash

# @name:Maintain Clear User Cache
# @description:Clear ~/.cache for all non-system users and report space freed
# @Category:Maintenance
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Measuring disk usage before cleanup"
before=$(df / | awk 'NR==2{print $3}')

@NEXTERM:STEP "Clearing user cache directories"
for home in /home/*/; do
    if [ -d "${home}.cache" ]; then
        size=$(du -sh "${home}.cache" 2>/dev/null | cut -f1)
        rm -rf "${home}.cache/"* 2>/dev/null
        echo "Cleared ${home}.cache ($size)"
    fi
done

after=$(df / | awk 'NR==2{print $3}')
freed=$(( (before - after) / 1024 ))

@NEXTERM:SUMMARY "Cache Cleanup" "Estimated Space Freed" "${freed} MB"

@NEXTERM:SUCCESS "User cache cleanup complete"

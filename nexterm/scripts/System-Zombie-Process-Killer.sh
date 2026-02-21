#!/bin/bash

# @name:System Zombie Process Killer
# @description:Scanning for zombie processes
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Scanning for zombie processes"

ZOMBIES=$(ps aux | awk '$8=="Z" {print $2, $11}')

if [ -z "$ZOMBIES" ]; then
    @NEXTERM:SUCCESS "No zombie processes found"
    exit 0
fi

ZOMBIE_COUNT=$(echo "$ZOMBIES" | wc -l)
@NEXTERM:WARN "Found $ZOMBIE_COUNT zombie processes"

echo "$ZOMBIES" | while read PID CMD; do
    PARENT_PID=$(ps -o ppid= -p $PID 2>/dev/null | tr -d ' ')
    PARENT_CMD=$(ps -o comm= -p $PARENT_PID 2>/dev/null)
    
    @NEXTERM:INFO "Zombie PID $PID ($CMD) - Parent: $PARENT_PID ($PARENT_CMD)"
done

@NEXTERM:CONFIRM "Attempt to kill parent processes to clean up zombies?"

echo "$ZOMBIES" | while read PID CMD; do
    PARENT_PID=$(ps -o ppid= -p $PID 2>/dev/null | tr -d ' ')
    PARENT_CMD=$(ps -o comm= -p $PARENT_PID 2>/dev/null)
    
    if [ ! -z "$PARENT_PID" ] && [ "$PARENT_PID" != "1" ]; then
        @NEXTERM:STEP "Killing parent process $PARENT_PID ($PARENT_CMD)"
        sudo kill -9 $PARENT_PID 2>/dev/null
        
        sleep 1
        
        if ps -p $PID > /dev/null 2>&1; then
            @NEXTERM:WARN "Zombie $PID still exists"
        else
            @NEXTERM:SUCCESS "Cleaned up zombie $PID"
        fi
    else
        @NEXTERM:WARN "Cannot kill parent PID $PARENT_PID (init or not found)"
    fi
done

# Recheck
REMAINING=$(ps aux | awk '$8=="Z"' | wc -l)

@NEXTERM:SUMMARY "Zombie Process Cleanup" "Initial Zombies" "$ZOMBIE_COUNT" "Remaining Zombies" "$REMAINING" "Cleaned" "$((ZOMBIE_COUNT - REMAINING))"

if [ "$REMAINING" -eq 0 ]; then
    @NEXTERM:SUCCESS "All zombie processes cleaned"
else
    @NEXTERM:WARN "$REMAINING zombie processes remain"
fi

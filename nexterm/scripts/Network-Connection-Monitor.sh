#!/bin/bash
@NEXTERM:INPUT "Enter critical hosts to monitor (space-separated)" "8.8.8.8 1.1.1.1"
HOSTS=$NEXTERM_INPUT

@NEXTERM:INPUT "Enter check interval in seconds" "60"
INTERVAL=$NEXTERM_INPUT

@NEXTERM:INPUT "Enter failure threshold before alert" "3"
THRESHOLD=$NEXTERM_INPUT

LOG_FILE="/var/log/connection-monitor-$(date +%Y%m%d).log"

@NEXTERM:STEP "Starting connection monitor"
@NEXTERM:INFO "Monitoring: $HOSTS"
@NEXTERM:INFO "Interval: ${INTERVAL}s, Threshold: $THRESHOLD failures"
@NEXTERM:INFO "Logging to: $LOG_FILE"

declare -A FAILURES

@NEXTERM:INFO "Press Ctrl+C to stop monitoring"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    for HOST in $HOSTS; do
        if ping -c 1 -W 2 "$HOST" &>/dev/null; then
            # Success - reset failure count
            if [ "${FAILURES[$HOST]}" -gt 0 ]; then
                echo "[$TIMESTAMP] $HOST back online after ${FAILURES[$HOST]} failures" | tee -a "$LOG_FILE"
                @NEXTERM:SUCCESS "$HOST back online"
            fi
            FAILURES[$HOST]=0
        else
            # Failure
            FAILURES[$HOST]=$((${FAILURES[$HOST]:-0} + 1))
            echo "[$TIMESTAMP] $HOST unreachable (failure ${FAILURES[$HOST]}/$THRESHOLD)" | tee -a "$LOG_FILE"
            
            if [ "${FAILURES[$HOST]}" -ge "$THRESHOLD" ]; then
                @NEXTERM:ERROR "$HOST down for ${FAILURES[$HOST]} consecutive checks"
            else
                @NEXTERM:WARN "$HOST unreachable (${FAILURES[$HOST]}/$THRESHOLD)"
            fi
        fi
    done
    
    sleep "$INTERVAL"
done

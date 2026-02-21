#!/bin/bash

# @name:Performance Disk IO Check
# @description:Analyzing disk I/O activity
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Analyzing disk I/O activity"

if ! command -v iotop &> /dev/null; then
    @NEXTERM:WARN "iotop not found - using alternative method"
    USE_IOTOP=false
else
    USE_IOTOP=true
fi

if [ "$USE_IOTOP" = true ]; then
    @NEXTERM:STEP "Collecting I/O stats with iotop (5 seconds)"
    sudo iotop -b -n 2 -d 2 -o > /tmp/iotop-output.txt
    
    @NEXTERM:INFO "Top I/O processes:"
    head -n 20 /tmp/iotop-output.txt
    
    TOP_IO_PROC=$(tail -n +8 /tmp/iotop-output.txt | head -n 1 | awk '{print $12}')
    TOP_IO_RATE=$(tail -n +8 /tmp/iotop-output.txt | head -n 1 | awk '{print $6}')
else
    @NEXTERM:STEP "Using /proc/diskstats method"
    
    # Snapshot 1
    cat /proc/diskstats > /tmp/diskstats1.txt
    sleep 2
    # Snapshot 2
    cat /proc/diskstats > /tmp/diskstats2.txt
    
    @NEXTERM:INFO "Disk activity:"
    paste /tmp/diskstats1.txt /tmp/diskstats2.txt | awk '{
        device=$3
        reads_delta=$7-$20
        writes_delta=$11-$24
        if(reads_delta > 0 || writes_delta > 0) {
            print device": R="reads_delta" W="writes_delta
        }
    }' | head -n 10
    
    TOP_IO_PROC="N/A (iotop not installed)"
    TOP_IO_RATE="N/A"
fi

@NEXTERM:STEP "Check for high I/O wait"
IOWAIT=$(iostat -c 1 2 2>/dev/null | tail -n 1 | awk '{print $4}' | cut -d'.' -f1)

if [ ! -z "$IOWAIT" ] && [ "$IOWAIT" -gt 10 ]; then
    @NEXTERM:WARN "High I/O wait detected: ${IOWAIT}%"
else
    @NEXTERM:INFO "I/O wait: ${IOWAIT:-N/A}%"
fi

# List processes by I/O
@NEXTERM:STEP "Processes sorted by I/O"
if [ -d /proc/1/io ]; then
    for PID in /proc/[0-9]*/io; do
        PID_NUM=$(echo $PID | cut -d'/' -f3)
        if [ -f "$PID" ]; then
            READ_BYTES=$(grep read_bytes "$PID" 2>/dev/null | awk '{print $2}')
            WRITE_BYTES=$(grep write_bytes "$PID" 2>/dev/null | awk '{print $2}')
            TOTAL_IO=$((READ_BYTES + WRITE_BYTES))
            CMD=$(ps -p "$PID_NUM" -o comm= 2>/dev/null)
            echo "$TOTAL_IO $PID_NUM $CMD"
        fi
    done | sort -rn | head -n 10 | while read TOTAL PID CMD; do
        TOTAL_MB=$((TOTAL / 1024 / 1024))
        @NEXTERM:INFO "  PID $PID ($CMD): ${TOTAL_MB}MB total I/O"
    done
fi

@NEXTERM:SUMMARY "Disk I/O Check" "Top I/O Process" "$TOP_IO_PROC" "I/O Rate" "$TOP_IO_RATE" "I/O Wait" "${IOWAIT:-N/A}%" "Method" "$([ "$USE_IOTOP" = true ] && echo 'iotop' || echo 'diskstats')"

@NEXTERM:SUCCESS "Disk I/O analysis complete"

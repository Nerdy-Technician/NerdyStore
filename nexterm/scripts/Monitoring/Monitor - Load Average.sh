#!/bin/bash

# @name:Monitor Load Average
# @description:Report 1/5/15 minute load averages relative to CPU count
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking system load averages"
ncpu=$(nproc)
read -r load1 load5 load15 _ < /proc/loadavg

@NEXTERM:SUMMARY "Load Average" "1 Min" "$load1" "5 Min" "$load5" "15 Min" "$load15" "CPU Count" "$ncpu"

if (( $(echo "$load1 > $ncpu" | bc -l) )); then
    @NEXTERM:WARN "1-minute load ($load1) exceeds CPU count ($ncpu) — system under pressure"
elif (( $(echo "$load5 > $ncpu" | bc -l) )); then
    @NEXTERM:WARN "5-minute load ($load5) exceeds CPU count ($ncpu)"
else
    @NEXTERM:SUCCESS "Load average is within normal range"
fi

#!/bin/bash

# @name:Monitor CPU Temperature
# @description:Report CPU temperature via lm-sensors; alert if too hot
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking CPU temperature"
if ! command -v sensors &>/dev/null; then
    @NEXTERM:WARN "lm-sensors not installed — run: apt install lm-sensors && sensors-detect"
    exit 1
fi

output=$(sensors 2>/dev/null)
echo "$output"
max_temp=$(echo "$output" | grep -oP '\+\K[0-9]+(?=\.[0-9]+°C)' | sort -n | tail -1)

@NEXTERM:SUMMARY "CPU Temperature" "Max Temp" "${max_temp}°C" "Alert Threshold" "85°C" "Warn Threshold" "70°C"

if [ -z "$max_temp" ]; then
    @NEXTERM:WARN "Could not parse temperature readings"
elif [ "$max_temp" -ge 85 ]; then
    @NEXTERM:WARN "CPU temp ${max_temp}°C exceeds 85°C — check cooling"
elif [ "$max_temp" -ge 70 ]; then
    @NEXTERM:WARN "CPU temp ${max_temp}°C is elevated (>70°C)"
else
    @NEXTERM:SUCCESS "CPU temp ${max_temp}°C is within normal range"
fi

#!/bin/bash

# @name:Check Gateway Reachability
# @description:Ping the default gateway to verify local routing is working
# @Category:Network
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Identifying default gateway"
gw=$(ip route | awk '/default/{print $3; exit}')
if [ -z "$gw" ]; then
    @NEXTERM:WARN "No default gateway found"
    exit 1
fi

@NEXTERM:STEP "Pinging gateway: $gw"
ping_result=$(ping -c 4 -W 2 "$gw" 2>&1)
echo "$ping_result"
loss=$(echo "$ping_result" | grep -oP '\d+(?=% packet loss)')
avg_ms=$(echo "$ping_result" | grep -oP 'avg[^=]*= \K[\d.]+' || echo "N/A")

@NEXTERM:SUMMARY "Gateway Reachability" "Gateway" "$gw" "Packet Loss" "${loss}%" "Avg RTT" "${avg_ms}ms"

if [ "$loss" = "100" ]; then
    @NEXTERM:WARN "Gateway $gw is unreachable — check network connectivity"
elif [ "${loss:-0}" -gt 0 ]; then
    @NEXTERM:WARN "Partial packet loss (${loss}%) to gateway $gw"
else
    @NEXTERM:SUCCESS "Gateway $gw is reachable (avg ${avg_ms}ms)"
fi

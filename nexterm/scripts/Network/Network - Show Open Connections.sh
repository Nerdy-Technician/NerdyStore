#!/bin/bash

# @name:Network Show Open Connections
# @description:List all established TCP connections with process info
# @Category:Network
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Listing established TCP connections"
ss -tnp state established

total=$(ss -tnp state established | grep -c ESTAB || echo 0)
listening=$(ss -tlnp | grep -c LISTEN || echo 0)

@NEXTERM:SUMMARY "Network Connections" "Established TCP" "$total" "Listening Services" "$listening"

@NEXTERM:SUCCESS "Connection snapshot complete"

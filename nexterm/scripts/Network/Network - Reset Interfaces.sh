#!/usr/bin/env bash

# @name:Network - Reset Interfaces
# @description:Show network interfaces
# @Category:Network
# @Language:Bash
# @OS:Linux

# Network - Reset Interfaces (from reset-interfaces.sh)
for iface in $(ls /sys/class/net | grep -v lo); do echo "Resetting $iface"; sudo ip link set "$iface" down; sleep 1; sudo ip link set "$iface" up; done
echo "All interfaces reset."; exit 0
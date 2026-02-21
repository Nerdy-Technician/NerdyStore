#!/usr/bin/env bash
# Check - Docker Service (from Check Docker is Running.sh)

# @name:Check Docker Service
# @description:Runs check docker service.
# @Category:Check
# @Language:Bash
# @OS:Linux

if systemctl is-active --quiet docker; then echo "Docker service running"; exit 0; else echo "Docker service NOT running"; exit 1; fi
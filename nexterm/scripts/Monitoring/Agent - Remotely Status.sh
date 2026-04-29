#!/bin/bash

# @name:Agent - Remotely Status
# @description:Check Remotely agent status
# @Category:Monitoring
# @Language:Bash
# @OS:Linux

# Agent - Remotely Status (from Check - Remotely_is_running.sh)
SERVICE="remotely-agent.service"
if [ "$(systemctl is-active $SERVICE)" = "active" ]; then echo "Remotely Agent Running"; exit 0; else echo "Remotely Agent NOT running"; systemctl start $SERVICE; if [ "$(systemctl is-active $SERVICE)" = "active" ]; then echo "Remotely Agent started"; exit 2; else echo "Remotely Agent failed to start"; exit 1; fi; fi
#!/bin/sh

# @name:Check - SwapSpace
# @description:Check swap space usage
# @Category:Monitoring
# @Language:Bash
# @OS:Linux


USED=$(free | awk '/Swap/ {print $3}')
TOTAL=$(free | awk '/Swap/ {print $2}')
if [ "$TOTAL" -gt 0 ]; then
  PERCENT=$(( 100 * USED / TOTAL ))
  if [ "$PERCENT" -gt 50 ]; then
    echo "$(date): Swap usage high at ${PERCENT}%"
  fi
fi
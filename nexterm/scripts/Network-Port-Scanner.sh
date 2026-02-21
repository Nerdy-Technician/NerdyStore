#!/bin/bash

# @name:Network Port Scanner
# @description:Scanning common ports on $TARGET
# @Language:Bash
# @OS:Linux

@NEXTERM:INPUT "Enter target IP or hostname" "192.168.1.1"
TARGET=$NEXTERM_INPUT

@NEXTERM:STEP "Scanning common ports on $TARGET"

COMMON_PORTS="21 22 23 25 53 80 443 445 3306 3389 5432 5900 6379 8080 8443 9000 27017"

OPEN_PORTS=()
CLOSED_COUNT=0

for PORT in $COMMON_PORTS; do
    @NEXTERM:STEP "Scanning port $PORT"
    
    if timeout 2 bash -c "echo >/dev/tcp/$TARGET/$PORT" 2>/dev/null; then
        SERVICE=$(getent services "$PORT/tcp" | awk '{print $1}')
        @NEXTERM:WARN "Port $PORT OPEN - Service: ${SERVICE:-Unknown}"
        OPEN_PORTS+=("$PORT:${SERVICE:-Unknown}")
    else
        CLOSED_COUNT=$((CLOSED_COUNT+1))
    fi
done

@NEXTERM:INFO "Scan complete: ${#OPEN_PORTS[@]} open, $CLOSED_COUNT closed/filtered"

if [ ${#OPEN_PORTS[@]} -gt 0 ]; then
    @NEXTERM:WARN "Open ports detected on $TARGET:"
    for PORT_INFO in "${OPEN_PORTS[@]}"; do
        PORT=$(echo "$PORT_INFO" | cut -d: -f1)
        SERVICE=$(echo "$PORT_INFO" | cut -d: -f2)
        @NEXTERM:INFO "  Port $PORT - $SERVICE"
    done
fi

@NEXTERM:SUMMARY "Port Scan Results" "Target" "$TARGET" "Open Ports" "${#OPEN_PORTS[@]}" "Closed Ports" "$CLOSED_COUNT" "Total Scanned" "$(echo $COMMON_PORTS | wc -w)"

if [ ${#OPEN_PORTS[@]} -eq 0 ]; then
    @NEXTERM:SUCCESS "No open ports found on common services"
else
    @NEXTERM:WARN "Found ${#OPEN_PORTS[@]} open ports"
fi

#!/bin/bash
@NEXTERM:STEP "Check for speedtest tool"

if ! command -v speedtest-cli &> /dev/null && ! command -v speedtest &> /dev/null; then
    @NEXTERM:WARN "speedtest-cli not found - attempting to install"
    @NEXTERM:CONFIRM "Install speedtest-cli via apt?"
    sudo apt-get install -y speedtest-cli
fi

@NEXTERM:STEP "Running network speed test"
@NEXTERM:INFO "This may take a minute..."

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
RESULT_FILE="/var/log/speedtest-$(date +%Y%m%d-%H%M%S).log"

if command -v speedtest-cli &> /dev/null; then
    SPEED_OUTPUT=$(speedtest-cli --simple 2>&1)
else
    SPEED_OUTPUT=$(speedtest --format=human-readable 2>&1)
fi

echo "$TIMESTAMP" > "$RESULT_FILE"
echo "$SPEED_OUTPUT" >> "$RESULT_FILE"

# Parse results
PING=$(echo "$SPEED_OUTPUT" | grep -i "ping" | awk '{print $2}')
DOWNLOAD=$(echo "$SPEED_OUTPUT" | grep -i "download" | awk '{print $2}')
UPLOAD=$(echo "$SPEED_OUTPUT" | grep -i "upload" | awk '{print $2}')

@NEXTERM:SUMMARY "Network Speed Test" "Ping" "${PING:-N/A} ms" "Download" "${DOWNLOAD:-N/A} Mbit/s" "Upload" "${UPLOAD:-N/A} Mbit/s" "Timestamp" "$TIMESTAMP" "Log" "$RESULT_FILE"

# Check thresholds
if [ ! -z "$DOWNLOAD" ]; then
    DOWNLOAD_NUM=$(echo "$DOWNLOAD" | cut -d'.' -f1)
    if [ "$DOWNLOAD_NUM" -lt 10 ]; then
        @NEXTERM:WARN "Download speed below 10 Mbit/s"
    else
        @NEXTERM:SUCCESS "Speed test completed"
    fi
else
    @NEXTERM:ERROR "Speed test failed"
fi

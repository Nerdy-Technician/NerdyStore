#!/bin/bash
@NEXTERM:STEP "Capturing system performance snapshot"

TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
SNAPSHOT_FILE="/var/log/performance-snapshot-$TIMESTAMP.txt"

@NEXTERM:STEP "Collect CPU information"
echo "=== PERFORMANCE SNAPSHOT: $TIMESTAMP ===" > "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

echo "=== CPU INFO ===" >> "$SNAPSHOT_FILE"
lscpu | grep -E "Model name|CPU\(s\)|MHz" >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect load averages"
echo "=== LOAD AVERAGE ===" >> "$SNAPSHOT_FILE"
uptime >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect memory usage"
echo "=== MEMORY USAGE ===" >> "$SNAPSHOT_FILE"
free -h >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect disk usage"
echo "=== DISK USAGE ===" >> "$SNAPSHOT_FILE"
df -hT >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect top CPU processes"
echo "=== TOP 10 CPU PROCESSES ===" >> "$SNAPSHOT_FILE"
ps -eo pid,user,comm,%cpu,%mem --sort=-%cpu | head -n 11 >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect top memory processes"
echo "=== TOP 10 MEMORY PROCESSES ===" >> "$SNAPSHOT_FILE"
ps -eo pid,user,comm,%mem,%cpu --sort=-%mem | head -n 11 >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect network connections"
echo "=== NETWORK CONNECTIONS ===" >> "$SNAPSHOT_FILE"
ss -s >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

@NEXTERM:STEP "Collect disk I/O stats"
echo "=== DISK I/O ===" >> "$SNAPSHOT_FILE"
iostat -x 1 2 2>/dev/null | tail -n +4 >> "$SNAPSHOT_FILE" || echo "iostat not available" >> "$SNAPSHOT_FILE"
echo "" >> "$SNAPSHOT_FILE"

# Parse key metrics for summary
LOAD_1MIN=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | tr -d ' ')
MEM_USED=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100}')
DISK_USED=$(df -h / | tail -n 1 | awk '{print $5}')
TOP_CPU_PROC=$(ps -eo comm,%cpu --sort=-%cpu | head -n 2 | tail -n 1 | awk '{print $1}')
TOP_CPU_PCT=$(ps -eo comm,%cpu --sort=-%cpu | head -n 2 | tail -n 1 | awk '{print $2}')

@NEXTERM:SUMMARY "Performance Snapshot" "Load (1min)" "$LOAD_1MIN" "Memory Used" "$MEM_USED" "Disk Used" "$DISK_USED" "Top Process" "$TOP_CPU_PROC ($TOP_CPU_PCT%)" "Snapshot File" "$SNAPSHOT_FILE"

@NEXTERM:SUCCESS "Performance snapshot saved to $SNAPSHOT_FILE"

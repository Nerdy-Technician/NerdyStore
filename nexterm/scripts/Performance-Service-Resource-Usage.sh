#!/bin/bash
@NEXTERM:STEP "Analyzing systemd service resource usage"

@NEXTERM:STEP "Collect CPU usage by service"
echo "=== TOP SERVICES BY CPU ==="
systemctl list-units --type=service --state=running --no-pager | grep -o '[^ ]*\.service' | while read SERVICE; do
    PID=$(systemctl show -p MainPID --value "$SERVICE" 2>/dev/null)
    if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
        CPU=$(ps -p "$PID" -o %cpu= 2>/dev/null | tr -d ' ')
        MEM=$(ps -p "$PID" -o %mem= 2>/dev/null | tr -d ' ')
        if [ ! -z "$CPU" ] && [ ! -z "$MEM" ]; then
            echo "$CPU $MEM $SERVICE $PID"
        fi
    fi
done | sort -rn | head -n 15 > /tmp/service-resources.txt

@NEXTERM:INFO "Top 15 services by CPU:"
cat /tmp/service-resources.txt | while read CPU MEM SERVICE PID; do
    @NEXTERM:INFO "  $SERVICE: CPU=${CPU}% MEM=${MEM}% (PID $PID)"
done

@NEXTERM:STEP "Collect memory usage by service"
echo ""
echo "=== TOP SERVICES BY MEMORY ==="
cat /tmp/service-resources.txt | sort -k2 -rn | head -n 10 > /tmp/service-mem.txt

@NEXTERM:INFO "Top 10 services by memory:"
cat /tmp/service-mem.txt | while read CPU MEM SERVICE PID; do
    @NEXTERM:INFO "  $SERVICE: MEM=${MEM}% CPU=${CPU}% (PID $PID)"
done

# Identify resource hogs
TOP_CPU_SERVICE=$(head -n 1 /tmp/service-resources.txt | awk '{print $3}')
TOP_CPU_PCT=$(head -n 1 /tmp/service-resources.txt | awk '{print $1}')
TOP_MEM_SERVICE=$(head -n 1 /tmp/service-mem.txt | awk '{print $3}')
TOP_MEM_PCT=$(head -n 1 /tmp/service-mem.txt | awk '{print $2}')

@NEXTERM:SUMMARY "Service Resource Usage" "Top CPU Service" "$TOP_CPU_SERVICE (${TOP_CPU_PCT}%)" "Top Memory Service" "$TOP_MEM_SERVICE (${TOP_MEM_PCT}%)" "Total Running Services" "$(systemctl list-units --type=service --state=running --no-legend | wc -l)"

# Check for high resource usage
if [ ! -z "$TOP_CPU_PCT" ]; then
    CPU_INT=$(echo "$TOP_CPU_PCT" | cut -d'.' -f1)
    if [ "$CPU_INT" -gt 50 ]; then
        @NEXTERM:WARN "High CPU usage detected: $TOP_CPU_SERVICE using ${TOP_CPU_PCT}%"
    else
        @NEXTERM:SUCCESS "Resource usage analysis complete"
    fi
fi

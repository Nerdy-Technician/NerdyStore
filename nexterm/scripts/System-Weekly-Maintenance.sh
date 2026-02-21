#!/bin/bash

# @name:System Weekly Maintenance
# @description:Starting weekly system maintenance
# @Category:System
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Starting weekly system maintenance"

LOG_FILE="/var/log/weekly-maintenance-$(date +%Y%m%d).log"

@NEXTERM:STEP "Update package lists"
sudo apt-get update -y | tee -a "$LOG_FILE"

@NEXTERM:STEP "Upgrade packages"
sudo apt-get upgrade -y | tee -a "$LOG_FILE"

@NEXTERM:STEP "Autoremove unused packages"
sudo apt-get autoremove -y | tee -a "$LOG_FILE"

@NEXTERM:STEP "Clean apt caches"
sudo apt-get clean && sudo apt-get autoclean | tee -a "$LOG_FILE"

@NEXTERM:STEP "Check disk usage"
DISK_USAGE=$(df -h / | tail -n 1 | awk '{print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -gt 80 ]; then
    @NEXTERM:WARN "Root disk usage is ${DISK_USAGE}% - consider cleanup"
    df -hT | tee -a "$LOG_FILE"
else
    @NEXTERM:INFO "Disk usage OK: ${DISK_USAGE}%"
fi

@NEXTERM:STEP "Check for stale systemd services"
FAILED_SERVICES=$(systemctl --failed --no-legend | wc -l)

if [ "$FAILED_SERVICES" -gt 0 ]; then
    @NEXTERM:WARN "Found $FAILED_SERVICES failed services"
    systemctl --failed | tee -a "$LOG_FILE"
    
    @NEXTERM:CONFIRM "Attempt to restart failed services?"
    systemctl --failed --no-legend | awk '{print $1}' | while read SERVICE; do
        @NEXTERM:STEP "Restarting $SERVICE"
        sudo systemctl restart "$SERVICE"
    done
fi

@NEXTERM:STEP "Check for required reboot"
if [ -f /var/run/reboot-required ]; then
    @NEXTERM:WARN "System reboot is required"
    REBOOT_PKGS=$(cat /var/run/reboot-required.pkgs 2>/dev/null)
    echo "Reboot required by: $REBOOT_PKGS" | tee -a "$LOG_FILE"
else
    @NEXTERM:INFO "No reboot required"
fi

@NEXTERM:SUMMARY "Weekly Maintenance Complete" "Disk Usage" "${DISK_USAGE}%" "Failed Services" "$FAILED_SERVICES" "Reboot Required" "$([ -f /var/run/reboot-required ] && echo 'Yes' || echo 'No')" "Log File" "$LOG_FILE"

@NEXTERM:SUCCESS "Weekly maintenance completed successfully"

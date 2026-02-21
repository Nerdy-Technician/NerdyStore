#!/bin/bash

# @name:Quick Reboot Required Check
# @description:Checking if reboot is required
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Checking if reboot is required"

REBOOT_REQUIRED=false
REASONS=""

# Check reboot-required file
if [ -f /var/run/reboot-required ]; then
    REBOOT_REQUIRED=true
    @NEXTERM:WARN "System reboot is required"
    
    if [ -f /var/run/reboot-required.pkgs ]; then
        @NEXTERM:INFO "Packages requiring reboot:"
        PACKAGES=$(cat /var/run/reboot-required.pkgs | tr '\n' ' ')
        REASONS="$REASONS Packages: $PACKAGES"
        @NEXTERM:INFO "$PACKAGES"
    fi
else
    @NEXTERM:INFO "No reboot-required flag found"
fi

# Check kernel version
@NEXTERM:STEP "Compare running vs installed kernel"
RUNNING_KERNEL=$(uname -r)
INSTALLED_KERNEL=$(dpkg -l | grep -E 'linux-image-[0-9]' | grep -E '^ii' | sort -V | tail -n 1 | awk '{print $2}' | sed 's/linux-image-//')

@NEXTERM:INFO "Running kernel: $RUNNING_KERNEL"
@NEXTERM:INFO "Latest installed: $INSTALLED_KERNEL"

if [ "$RUNNING_KERNEL" != "$INSTALLED_KERNEL" ]; then
    REBOOT_REQUIRED=true
    REASONS="$REASONS Kernel update: $RUNNING_KERNEL -> $INSTALLED_KERNEL"
    @NEXTERM:WARN "Running kernel differs from installed - reboot recommended"
fi

# Check services needing restart
@NEXTERM:STEP "Check for services needing restart"
if command -v needrestart &> /dev/null; then
    SERVICES_RESTART=$(sudo needrestart -b -r l 2>/dev/null | grep "NEEDRESTART-SVC" | cut -d: -f2 | wc -l)
    if [ "$SERVICES_RESTART" -gt 0 ]; then
        @NEXTERM:WARN "$SERVICES_RESTART services need restart after library updates"
        REASONS="$REASONS $SERVICES_RESTART services need restart"
        sudo needrestart -b -r l 2>/dev/null | grep "NEEDRESTART-SVC" | cut -d: -f2 | while read SVC; do
            @NEXTERM:INFO "  - $SVC"
        done
    fi
else
    @NEXTERM:INFO "needrestart not installed - skipping service check"
fi

# Check uptime
@NEXTERM:STEP "Check system uptime"
UPTIME_DAYS=$(awk '{print int($1/86400)}' /proc/uptime)
@NEXTERM:INFO "System uptime: $UPTIME_DAYS days"

if [ "$UPTIME_DAYS" -gt 90 ]; then
    @NEXTERM:WARN "System has been up for $UPTIME_DAYS days - consider rebooting"
    REASONS="$REASONS Long uptime: ${UPTIME_DAYS} days"
fi

@NEXTERM:SUMMARY "Reboot Check" "Reboot Required" "$([ "$REBOOT_REQUIRED" = true ] && echo 'Yes' || echo 'No')" "Running Kernel" "$RUNNING_KERNEL" "Latest Kernel" "$INSTALLED_KERNEL" "Uptime (days)" "$UPTIME_DAYS"

if [ "$REBOOT_REQUIRED" = true ]; then
    @NEXTERM:ERROR "Reboot required: $REASONS"
    @NEXTERM:CONFIRM "Schedule reboot now?"
    sudo shutdown -r now
else
    @NEXTERM:SUCCESS "No reboot required"
fi

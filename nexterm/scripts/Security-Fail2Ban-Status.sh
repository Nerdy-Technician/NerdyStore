#!/bin/bash
@NEXTERM:STEP "Check Fail2Ban installation"

if ! command -v fail2ban-client &> /dev/null; then
    @NEXTERM:ERROR "Fail2Ban is not installed"
    exit 1
fi

@NEXTERM:STEP "Get Fail2Ban status"
F2B_STATUS=$(sudo systemctl is-active fail2ban)
if [ "$F2B_STATUS" != "active" ]; then
    @NEXTERM:ERROR "Fail2Ban service is not running"
    exit 1
fi

@NEXTERM:STEP "List active jails"
JAILS=$(sudo fail2ban-client status | grep "Jail list" | sed 's/.*://; s/,//g')

TOTAL_BANNED=0
JAIL_INFO=""

for JAIL in $JAILS; do
    @NEXTERM:STEP "Check jail: $JAIL"
    BANNED=$(sudo fail2ban-client status $JAIL | grep "Currently banned" | awk '{print $NF}')
    TOTAL=$(sudo fail2ban-client status $JAIL | grep "Total banned" | awk '{print $NF}')
    TOTAL_BANNED=$((TOTAL_BANNED + BANNED))
    
    if [ "$BANNED" -gt 0 ]; then
        BANNED_IPS=$(sudo fail2ban-client status $JAIL | grep "Banned IP list" | sed 's/.*://;')
        @NEXTERM:INFO "Jail $JAIL: $BANNED currently banned ($TOTAL total) - IPs:$BANNED_IPS"
    fi
done

@NEXTERM:SUMMARY "Fail2Ban Status" "Service" "$F2B_STATUS" "Active Jails" "$(echo $JAILS | wc -w)" "Currently Banned" "$TOTAL_BANNED"

if [ "$TOTAL_BANNED" -gt 0 ]; then
    @NEXTERM:WARN "$TOTAL_BANNED IPs currently banned"
else
    @NEXTERM:SUCCESS "Fail2Ban active - no current bans"
fi

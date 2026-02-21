#!/bin/bash

# @name:Quick Port Forward
# @description:UFW port forwarding setup
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "UFW port forwarding setup"

if ! command -v ufw &> /dev/null; then
    @NEXTERM:ERROR "UFW is not installed"
    exit 1
fi

# Check UFW status
UFW_STATUS=$(sudo ufw status | grep -i "Status: active")
if [ -z "$UFW_STATUS" ]; then
    @NEXTERM:WARN "UFW is not active"
    @NEXTERM:CONFIRM "Enable UFW firewall?"
    sudo ufw --force enable
fi

@NEXTERM:SELECT CHOICE "Port forwarding action" "Add forwarding rule" "List current rules" "Delete rule" "Cancel"

CHOICE=$NEXTERM_CHOICE

if [ "$CHOICE" = "Cancel" ]; then
    @NEXTERM:INFO "Operation cancelled"
    exit 0
fi

if [ "$CHOICE" = "List current rules" ]; then
    @NEXTERM:STEP "Current UFW rules"
    sudo ufw status numbered
    @NEXTERM:INFO "Port forwarding rules shown above"
    exit 0
fi

if [ "$CHOICE" = "Delete rule" ]; then
    @NEXTERM:STEP "Current rules"
    sudo ufw status numbered
    @NEXTERM:INPUT "Enter rule number to delete" "1"
    RULE_NUM=$NEXTERM_INPUT
    @NEXTERM:CONFIRM "Delete rule #$RULE_NUM?"
    sudo ufw delete "$RULE_NUM"
    @NEXTERM:SUCCESS "Rule deleted"
    exit 0
fi

# Add forwarding rule
@NEXTERM:INPUT "Enter external port" "8080"
EXT_PORT=$NEXTERM_INPUT

@NEXTERM:INPUT "Enter internal IP" "192.168.1.100"
INT_IP=$NEXTERM_INPUT

@NEXTERM:INPUT "Enter internal port" "80"
INT_PORT=$NEXTERM_INPUT

@NEXTERM:SELECT CHOICE "Select protocol" "tcp" "udp" "both"
PROTOCOL=$NEXTERM_CHOICE

@NEXTERM:STEP "Validating inputs"

# Validate port numbers
if ! [[ "$EXT_PORT" =~ ^[0-9]+$ ]] || [ "$EXT_PORT" -lt 1 ] || [ "$EXT_PORT" -gt 65535 ]; then
    @NEXTERM:ERROR "Invalid external port: $EXT_PORT"
    exit 1
fi

if ! [[ "$INT_PORT" =~ ^[0-9]+$ ]] || [ "$INT_PORT" -lt 1 ] || [ "$INT_PORT" -gt 65535 ]; then
    @NEXTERM:ERROR "Invalid internal port: $INT_PORT"
    exit 1
fi

# Validate IP address
if ! [[ "$INT_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    @NEXTERM:ERROR "Invalid IP address: $INT_IP"
    exit 1
fi

@NEXTERM:CONFIRM "Forward port $EXT_PORT to $INT_IP:$INT_PORT ($PROTOCOL)?"

@NEXTERM:STEP "Enabling IP forwarding"
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null

@NEXTERM:STEP "Adding UFW rules"

if [ "$PROTOCOL" = "both" ] || [ "$PROTOCOL" = "tcp" ]; then
    sudo ufw route allow proto tcp from any to "$INT_IP" port "$INT_PORT"
    sudo ufw allow "$EXT_PORT/tcp"
    @NEXTERM:SUCCESS "TCP rule added"
fi

if [ "$PROTOCOL" = "both" ] || [ "$PROTOCOL" = "udp" ]; then
    sudo ufw route allow proto udp from any to "$INT_IP" port "$INT_PORT"
    sudo ufw allow "$EXT_PORT/udp"
    @NEXTERM:SUCCESS "UDP rule added"
fi

@NEXTERM:STEP "Reload UFW"
sudo ufw reload

@NEXTERM:SUMMARY "Port Forwarding Setup" "External Port" "$EXT_PORT" "Internal Target" "$INT_IP:$INT_PORT" "Protocol" "$PROTOCOL"

@NEXTERM:SUCCESS "Port forwarding configured successfully"
@NEXTERM:INFO "Note: Additional iptables NAT rules may be required for full forwarding"

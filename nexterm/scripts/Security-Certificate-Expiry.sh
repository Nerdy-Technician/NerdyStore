#!/bin/bash

# @name:Security Certificate Expiry
# @description:Check certificate expiry dates
# @Category:Security
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Check certificate expiry dates"

CERT_DIR="/etc/letsencrypt/live"

if [ ! -d "$CERT_DIR" ]; then
    @NEXTERM:INPUT "Certificate directory not found. Enter cert path" "/etc/ssl/certs"
    CERT_DIR=$NEXTERM_INPUT
fi

@NEXTERM:STEP "Scanning for certificates in $CERT_DIR"

EXPIRING_SOON=0
EXPIRED=0

if [ -d "$CERT_DIR" ]; then
    for DOMAIN_DIR in "$CERT_DIR"/*; do
        if [ -d "$DOMAIN_DIR" ]; then
            CERT="$DOMAIN_DIR/cert.pem"
            if [ -f "$CERT" ]; then
                DOMAIN=$(basename "$DOMAIN_DIR")
                EXPIRY=$(openssl x509 -enddate -noout -in "$CERT" | cut -d= -f2)
                EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
                NOW_EPOCH=$(date +%s)
                DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
                
                if [ "$DAYS_LEFT" -lt 0 ]; then
                    @NEXTERM:ERROR "Certificate for $DOMAIN EXPIRED $((DAYS_LEFT * -1)) days ago"
                    EXPIRED=$((EXPIRED+1))
                elif [ "$DAYS_LEFT" -lt 30 ]; then
                    @NEXTERM:WARN "Certificate for $DOMAIN expires in $DAYS_LEFT days"
                    EXPIRING_SOON=$((EXPIRING_SOON+1))
                else
                    @NEXTERM:INFO "Certificate for $DOMAIN expires in $DAYS_LEFT days"
                fi
            fi
        fi
    done
else
    @NEXTERM:ERROR "Certificate directory not found: $CERT_DIR"
    exit 1
fi

@NEXTERM:SUMMARY "Certificate Expiry Check" "Expired" "$EXPIRED" "Expiring Soon (<30 days)" "$EXPIRING_SOON"

if [ "$EXPIRED" -gt 0 ]; then
    @NEXTERM:ERROR "Found $EXPIRED expired certificates"
elif [ "$EXPIRING_SOON" -gt 0 ]; then
    @NEXTERM:WARN "Found $EXPIRING_SOON certificates expiring soon"
else
    @NEXTERM:SUCCESS "All certificates valid and not expiring soon"
fi

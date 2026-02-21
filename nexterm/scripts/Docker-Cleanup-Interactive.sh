#!/bin/bash

# @name:Docker Cleanup Interactive
# @description:Docker cleanup: $CHOICE
# @Language:Bash
# @OS:Linux

@NEXTERM:SELECT CHOICE "Select cleanup operation" "Prune stopped containers" "Remove unused images" "Remove dangling volumes" "Full cleanup (all)" "Cancel"

CHOICE=$NEXTERM_CHOICE

if [ "$CHOICE" = "Cancel" ]; then
    @NEXTERM:INFO "Cleanup cancelled"
    exit 0
fi

@NEXTERM:STEP "Docker cleanup: $CHOICE"

BEFORE_SIZE=$(docker system df -v | grep "Total" | awk '{print $4}')

if [ "$CHOICE" = "Prune stopped containers" ]; then
    @NEXTERM:CONFIRM "Remove all stopped containers?"
    docker container prune -f
    @NEXTERM:SUCCESS "Stopped containers removed"
    
elif [ "$CHOICE" = "Remove unused images" ]; then
    @NEXTERM:CONFIRM "Remove all unused images?"
    docker image prune -a -f
    @NEXTERM:SUCCESS "Unused images removed"
    
elif [ "$CHOICE" = "Remove dangling volumes" ]; then
    @NEXTERM:CONFIRM "Remove all dangling volumes?"
    docker volume prune -f
    @NEXTERM:SUCCESS "Dangling volumes removed"
    
elif [ "$CHOICE" = "Full cleanup (all)" ]; then
    @NEXTERM:CONFIRM "Remove ALL unused containers, images, volumes, and networks?"
    docker system prune -a --volumes -f
    @NEXTERM:SUCCESS "Full cleanup completed"
fi

AFTER_SIZE=$(docker system df -v | grep "Total" | awk '{print $4}')

@NEXTERM:SUMMARY "Cleanup Results" "Before" "$BEFORE_SIZE" "After" "$AFTER_SIZE" "Operation" "$CHOICE"

#!/bin/bash
@NEXTERM:STEP "Running Docker health check"

if ! command -v docker &> /dev/null; then
    @NEXTERM:ERROR "Docker is not installed"
    exit 1
fi

ISSUES=0

# Check unhealthy containers
@NEXTERM:STEP "Check container health"
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
RESTARTING=$(docker ps --filter "status=restarting" --format "{{.Names}}" | wc -l)

if [ "$UNHEALTHY" -gt 0 ]; then
    @NEXTERM:ERROR "Found $UNHEALTHY unhealthy containers"
    docker ps --filter "health=unhealthy" --format "table {{.Names}}\t{{.Status}}"
    ISSUES=$((ISSUES+1))
fi

if [ "$RESTARTING" -gt 0 ]; then
    @NEXTERM:WARN "Found $RESTARTING containers restarting"
    docker ps --filter "status=restarting" --format "table {{.Names}}\t{{.Status}}"
    ISSUES=$((ISSUES+1))
fi

# Check disk usage
@NEXTERM:STEP "Check Docker disk usage"
DISK_USAGE=$(docker system df | grep "Images\|Containers\|Local Volumes")
RECLAIMABLE=$(docker system df | grep "Reclaimable" | awk '{sum+=$4} END {print sum}')

if [ "$RECLAIMABLE" -gt 10 ]; then
    @NEXTERM:WARN "Over ${RECLAIMABLE}GB reclaimable space available"
    ISSUES=$((ISSUES+1))
fi

# Check for orphaned volumes
@NEXTERM:STEP "Check orphaned volumes"
ORPHANED_VOLUMES=$(docker volume ls -qf dangling=true | wc -l)

if [ "$ORPHANED_VOLUMES" -gt 0 ]; then
    @NEXTERM:WARN "Found $ORPHANED_VOLUMES orphaned volumes"
    ISSUES=$((ISSUES+1))
fi

# Check network conflicts
@NEXTERM:STEP "Check network status"
NETWORKS=$(docker network ls --format "{{.Name}}" | wc -l)

@NEXTERM:SUMMARY "Docker Health Check" "Unhealthy Containers" "$UNHEALTHY" "Restarting Containers" "$RESTARTING" "Orphaned Volumes" "$ORPHANED_VOLUMES" "Reclaimable Space (GB)" "$RECLAIMABLE" "Issues Found" "$ISSUES"

if [ "$ISSUES" -eq 0 ]; then
    @NEXTERM:SUCCESS "Docker health check passed"
else
    @NEXTERM:WARN "Docker health check found $ISSUES issues"
fi

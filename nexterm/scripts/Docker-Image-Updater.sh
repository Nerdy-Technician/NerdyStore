#!/bin/bash
@NEXTERM:STEP "Check for Docker image updates"

if ! command -v docker &> /dev/null; then
    @NEXTERM:ERROR "Docker is not installed"
    exit 1
fi

@NEXTERM:STEP "Get running containers"
CONTAINERS=$(docker ps --format "{{.ID}}:{{.Image}}")

if [ -z "$CONTAINERS" ]; then
    @NEXTERM:INFO "No running containers found"
    exit 0
fi

UPDATES_AVAILABLE=0
UPDATED_IMAGES=""

for CONTAINER_INFO in $CONTAINERS; do
    CONTAINER_ID=$(echo "$CONTAINER_INFO" | cut -d: -f1)
    IMAGE=$(echo "$CONTAINER_INFO" | cut -d: -f2)
    
    @NEXTERM:STEP "Checking image: $IMAGE"
    
    # Get current digest
    CURRENT_DIGEST=$(docker inspect --format='{{.Image}}' "$CONTAINER_ID")
    
    # Pull latest
    docker pull "$IMAGE" -q 2>/dev/null
    
    # Get new digest
    NEW_DIGEST=$(docker inspect --format='{{.Id}}' "$IMAGE")
    
    if [ "$CURRENT_DIGEST" != "$NEW_DIGEST" ]; then
        @NEXTERM:WARN "Update available for $IMAGE"
        UPDATES_AVAILABLE=$((UPDATES_AVAILABLE+1))
        UPDATED_IMAGES="$UPDATED_IMAGES $IMAGE"
    else
        @NEXTERM:INFO "$IMAGE is up to date"
    fi
done

if [ "$UPDATES_AVAILABLE" -gt 0 ]; then
    @NEXTERM:CONFIRM "Found $UPDATES_AVAILABLE image updates. Restart containers with new images?"
    
    for IMAGE in $UPDATED_IMAGES; do
        CONTAINER_ID=$(docker ps --filter "ancestor=$IMAGE" --format "{{.ID}}")
        CONTAINER_NAME=$(docker ps --filter "ancestor=$IMAGE" --format "{{.Names}}")
        
        @NEXTERM:STEP "Restarting container: $CONTAINER_NAME"
        docker restart "$CONTAINER_ID"
    done
    
    @NEXTERM:SUCCESS "Updated and restarted $UPDATES_AVAILABLE containers"
else
    @NEXTERM:SUCCESS "All images are up to date"
fi

@NEXTERM:SUMMARY "Image Update Check" "Containers Checked" "$(echo $CONTAINERS | wc -w)" "Updates Found" "$UPDATES_AVAILABLE"

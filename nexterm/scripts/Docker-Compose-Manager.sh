#!/bin/bash

# @name:Docker Compose Manager
# @description:Scanning for docker-compose projects
# @Category:Docker
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Scanning for docker-compose projects"

SEARCH_DIRS=("/opt" "/var/docker" "$HOME/docker" "/srv")
PROJECTS=()

for DIR in "${SEARCH_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        while IFS= read -r -d '' file; do
            PROJECT_DIR=$(dirname "$file")
            PROJECT_NAME=$(basename "$PROJECT_DIR")
            PROJECTS+=("$PROJECT_NAME:$PROJECT_DIR")
        done < <(find "$DIR" -maxdepth 3 -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null -print0)
    fi
done

if [ ${#PROJECTS[@]} -eq 0 ]; then
    @NEXTERM:ERROR "No docker-compose projects found"
    exit 1
fi

@NEXTERM:INFO "Found ${#PROJECTS[@]} docker-compose projects"

# Build selection list
PROJECT_NAMES=""
for PROJECT in "${PROJECTS[@]}"; do
    NAME=$(echo "$PROJECT" | cut -d: -f1)
    PROJECT_NAMES="$PROJECT_NAMES \"$NAME\""
done

@NEXTERM:SELECT CHOICE "Select docker-compose project" $PROJECT_NAMES

SELECTED_PROJECT=$NEXTERM_CHOICE

# Find the path for selected project
for PROJECT in "${PROJECTS[@]}"; do
    NAME=$(echo "$PROJECT" | cut -d: -f1)
    if [ "$NAME" = "$SELECTED_PROJECT" ]; then
        PROJECT_PATH=$(echo "$PROJECT" | cut -d: -f2)
        break
    fi
done

@NEXTERM:SELECT CHOICE "Select action" "up -d (start)" "down (stop)" "restart" "logs (tail)" "pull (update images)" "ps (status)"

ACTION=$NEXTERM_CHOICE

@NEXTERM:STEP "Running: docker-compose $ACTION on $SELECTED_PROJECT"

cd "$PROJECT_PATH" || exit 1

case "$ACTION" in
    "up -d (start)")
        docker-compose up -d
        @NEXTERM:SUCCESS "Project started"
        ;;
    "down (stop)")
        @NEXTERM:CONFIRM "Stop all containers in $SELECTED_PROJECT?"
        docker-compose down
        @NEXTERM:SUCCESS "Project stopped"
        ;;
    "restart")
        docker-compose restart
        @NEXTERM:SUCCESS "Project restarted"
        ;;
    "logs (tail)")
        docker-compose logs --tail=50 -f
        ;;
    "pull (update images)")
        docker-compose pull
        @NEXTERM:SUCCESS "Images updated"
        ;;
    "ps (status)")
        docker-compose ps
        ;;
esac

@NEXTERM:SUMMARY "Docker Compose Manager" "Project" "$SELECTED_PROJECT" "Action" "$ACTION" "Path" "$PROJECT_PATH"

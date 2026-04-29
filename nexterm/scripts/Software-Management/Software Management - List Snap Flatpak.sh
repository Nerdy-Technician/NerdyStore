#!/usr/bin/env bash

# @name:Software Management - List Snap Flatpak
# @description:List installed packages
# @Category:Software Management
# @Language:Bash
# @OS:Linux

# Software Management - List Snap Flatpak (from list-snap-flatpak.sh)
if command -v snap >/dev/null 2>&1; then echo "Snap packages:"; snap list; else echo "Snap not installed"; fi
if command -v flatpak >/dev/null 2>&1; then echo "\nFlatpak packages:"; flatpak list; else echo "Flatpak not installed"; fi
exit 0
#!/bin/bash

# @name:Quick User Add With Key
# @description:Create new user with SSH key
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Create new user with SSH key"

@NEXTERM:INPUT "Enter username" "newuser"
USERNAME=$NEXTERM_INPUT

# Check if user exists
if id "$USERNAME" &>/dev/null; then
    @NEXTERM:ERROR "User $USERNAME already exists"
    exit 1
fi

@NEXTERM:CONFIRM "Create user $USERNAME?"

@NEXTERM:STEP "Creating user account"
sudo useradd -m -s /bin/bash "$USERNAME"

if [ $? -ne 0 ]; then
    @NEXTERM:ERROR "Failed to create user"
    exit 1
fi

@NEXTERM:SUCCESS "User $USERNAME created"

# Setup SSH directory
@NEXTERM:STEP "Setting up SSH directory"
USER_HOME=$(eval echo ~$USERNAME)
SSH_DIR="$USER_HOME/.ssh"

sudo mkdir -p "$SSH_DIR"
sudo chmod 700 "$SSH_DIR"

# Get SSH public key
@NEXTERM:SELECT CHOICE "SSH key input method" "Paste key now" "Load from file" "Skip SSH key"

CHOICE=$NEXTERM_CHOICE

if [ "$CHOICE" = "Paste key now" ]; then
    @NEXTERM:INPUT "Paste SSH public key" "ssh-rsa AAAA..."
    SSH_KEY=$NEXTERM_INPUT
    echo "$SSH_KEY" | sudo tee "$SSH_DIR/authorized_keys" > /dev/null
    @NEXTERM:SUCCESS "SSH key added"
    
elif [ "$CHOICE" = "Load from file" ]; then
    @NEXTERM:INPUT "Enter path to public key file" "$HOME/.ssh/id_rsa.pub"
    KEY_FILE=$NEXTERM_INPUT
    
    if [ -f "$KEY_FILE" ]; then
        sudo cp "$KEY_FILE" "$SSH_DIR/authorized_keys"
        @NEXTERM:SUCCESS "SSH key loaded from file"
    else
        @NEXTERM:ERROR "Key file not found: $KEY_FILE"
    fi
else
    @NEXTERM:INFO "Skipping SSH key setup"
fi

# Set permissions
if [ -f "$SSH_DIR/authorized_keys" ]; then
    sudo chmod 600 "$SSH_DIR/authorized_keys"
    sudo chown -R "$USERNAME:$USERNAME" "$SSH_DIR"
fi

# Configure sudo access
@NEXTERM:CONFIRM "Grant sudo privileges to $USERNAME?"

if [ $? -eq 0 ]; then
    sudo usermod -aG sudo "$USERNAME"
    @NEXTERM:SUCCESS "Sudo privileges granted"
else
    @NEXTERM:INFO "Sudo privileges not granted"
fi

# Optional: Set password
@NEXTERM:CONFIRM "Set password for $USERNAME?"

if [ $? -eq 0 ]; then
    sudo passwd "$USERNAME"
else
    @NEXTERM:INFO "Password not set - SSH key authentication only"
fi

@NEXTERM:SUMMARY "User Creation Complete" "Username" "$USERNAME" "Home Directory" "$USER_HOME" "SSH Key" "$([ -f $SSH_DIR/authorized_keys ] && echo 'Configured' || echo 'Not configured')" "Sudo Access" "$(groups $USERNAME | grep -q sudo && echo 'Yes' || echo 'No')"

@NEXTERM:SUCCESS "User $USERNAME setup complete"

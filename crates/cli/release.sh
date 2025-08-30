#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Releasing ef CLI...${NC}"

# Get current version
CURRENT_VERSION=$(grep "^version" Cargo.toml | sed -E 's/version = "(.*)"/\1/')
echo -e "Current version: ${YELLOW}$CURRENT_VERSION${NC}"

# Build release
echo -e "\n${GREEN}Building release version...${NC}"
cargo build --release

# Install to cargo bin
echo -e "\n${GREEN}Installing to ~/.cargo/bin...${NC}"
cargo install --path . --force

# Check if ~/.cargo/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.cargo/bin:"* ]]; then
    echo -e "\n${YELLOW}⚠️  Warning: ~/.cargo/bin is not in your PATH${NC}"
    echo "Add this to your shell config file (.zshrc, .bashrc, etc.):"
    echo -e "${GREEN}export PATH=\"\$HOME/.cargo/bin:\$PATH\"${NC}"
fi

# Show installation info
echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo -e "Binary location: ${YELLOW}~/.cargo/bin/ef${NC}"
echo -e "Version: ${YELLOW}$CURRENT_VERSION${NC}"

# Test the installation
echo -e "\n${GREEN}Testing installation...${NC}"
if command -v ef &> /dev/null; then
    ef --version
    echo -e "${GREEN}✅ ef is ready to use!${NC}"
else
    echo -e "${YELLOW}⚠️  ef command not found. Please check your PATH.${NC}"
fi
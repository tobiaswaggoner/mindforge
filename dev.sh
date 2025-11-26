#!/bin/bash
# MindForge Development Server
# Startet Backend und Frontend parallel mit Hot Reload

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/apps/backend"
VENV_DIR="$BACKEND_DIR/.venv"

# Colors (ANSI)
C_RESET=$'\033[0m'
C_GREEN=$'\033[0;32m'
C_BLUE=$'\033[0;34m'
C_YELLOW=$'\033[0;33m'
C_CYAN=$'\033[0;36m'

echo -e "${C_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
echo -e "${C_BLUE}  MindForge Development Servers (Hot Reload)${C_RESET}"
echo -e "${C_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
echo ""

# Setup Python venv if needed
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${C_YELLOW}Creating Python virtual environment...${C_RESET}"
    python -m venv "$VENV_DIR"
    source "$VENV_DIR/Scripts/activate" 2>/dev/null || source "$VENV_DIR/bin/activate"
    pip install -q -r "$BACKEND_DIR/requirements.txt"
    echo -e "${C_GREEN}Dependencies installed.${C_RESET}"
    echo ""
else
    source "$VENV_DIR/Scripts/activate" 2>/dev/null || source "$VENV_DIR/bin/activate"
fi

echo -e "  ${C_CYAN}Backend${C_RESET}  → http://localhost:4202"
echo -e "  ${C_GREEN}Frontend${C_RESET} → http://localhost:4201"
echo -e "  ${C_CYAN}API Docs${C_RESET} → http://localhost:4202/docs"
echo ""
echo -e "${C_YELLOW}  Press Ctrl+C to stop all servers${C_RESET}"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${C_BLUE}Stopping servers...${C_RESET}"
    pkill -P $$ 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend with hot reload
(
    cd "$BACKEND_DIR"
    source "$VENV_DIR/Scripts/activate" 2>/dev/null || source "$VENV_DIR/bin/activate"
    uvicorn src.main:app --reload --port 4202 2>&1 | while IFS= read -r line; do
        echo -e "${C_CYAN}[backend]${C_RESET}  $line"
    done
) &

# Small delay to let backend start first
sleep 2

# Start Frontend with hot reload
(
    cd "$SCRIPT_DIR/apps/admin"
    npm run dev 2>&1 | while IFS= read -r line; do
        echo -e "${C_GREEN}[frontend]${C_RESET} $line"
    done
) &

# Wait for all background processes
wait

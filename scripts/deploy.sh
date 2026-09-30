#!/usr/bin/env bash
# ==============================================================================
# Nuclear Energy Valley 3D - Automated Deployment Script
# Reads configuration from .env and installs / builds / deploys the application.
# ==============================================================================

set -euo pipefail

# ANSI color codes
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}⚛️ Nuclear Energy Valley 3D - Deployment Pipeline${RESET}"
echo -e "Started at: $(date -u +"%Y-%m-%d %H:%M:%SZ")\n"

# Determine project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Load .env configuration if present
load_env_file() {
  local env_file="$1"
  while IFS='=' read -r key value || [ -n "${key:-}" ]; do
    # Strip carriage return and leading/trailing whitespace from key
    key=$(echo "${key:-}" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    # Skip comments and empty lines
    [[ "${key}" =~ ^# ]] && continue
    [ -z "${key}" ] && continue
    # Strip carriage return and surrounding quotes from value
    value=$(echo "${value:-}" | tr -d '\r' | sed -e 's/^[[:space:]]*//;s/[[:space:]]*$//' -e 's/^"//;s/"$//' -e "s/^'//;s/'$//")
    export "${key}=${value}"
  done < "${env_file}"
}

if [ -f ".env" ]; then
  echo -e "${GREEN}✓ Loading configuration from .env${RESET}"
  load_env_file ".env"
elif [ -f ".env.example" ]; then
  echo -e "${YELLOW}ℹ .env not found; using fallback defaults from .env.example${RESET}"
  load_env_file ".env.example"
fi

# Set sensible defaults
APP_ENV="${APP_ENV:-production}"
DEPLOY_METHOD="${DEPLOY_METHOD:-local}"
DEPLOY_TARGET_DIR="${DEPLOY_TARGET_DIR:-${PROJECT_ROOT}/dist}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-}"

echo -e "Target Environment : ${BOLD}${APP_ENV}${RESET}"
echo -e "Deploy Method      : ${BOLD}${DEPLOY_METHOD}${RESET}"
echo -e "Deploy Destination : ${BOLD}${DEPLOY_TARGET_DIR}${RESET}\n"

# Step 1: Verify prerequisites
echo -e "${CYAN}▶ Step 1/4: Checking system prerequisites...${RESET}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Error: Node.js is required but not installed.${RESET}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}✗ Error: npm is required but not installed.${RESET}"; exit 1; }

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "  Node.js version : ${GREEN}${NODE_VERSION}${RESET}"
echo -e "  npm version     : ${GREEN}${NPM_VERSION}${RESET}"

# Step 2: Install dependencies
echo -e "\n${CYAN}▶ Step 2/4: Installing dependencies...${RESET}"
if [ -f "package-lock.json" ]; then
  npm ci --include=dev --prefer-offline --no-audit || npm install --include=dev --no-audit
else
  npm install --include=dev --no-audit
fi

# Step 3: Verify isotope dataset & build production bundle
echo -e "\n${CYAN}▶ Step 3/4: Building application bundle...${RESET}"
if [ ! -f "public/data/isotopes.json" ]; then
  echo -e "  Dataset not found; generating from raw AME2020 sources..."
  npm run build:data
fi

npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo -e "${RED}✗ Build failed: dist/index.html not created.${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ Build artifacts created in ${PROJECT_ROOT}/dist${RESET}"

# Step 4: Execute deployment
echo -e "\n${CYAN}▶ Step 4/4: Deploying artifacts...${RESET}"
if [ "${DEPLOY_METHOD}" = "local" ]; then
  if [ "${DEPLOY_TARGET_DIR}" = "${PROJECT_ROOT}/dist" ]; then
    echo -e "  ${GREEN}✓ Local deployment complete (in-place in ${DEPLOY_TARGET_DIR}).${RESET}"
  else
    echo -e "  Copying dist files to ${DEPLOY_TARGET_DIR}..."
    mkdir -p "${DEPLOY_TARGET_DIR}"
    if command -v rsync >/dev/null 2>&1; then
      rsync -av --delete dist/ "${DEPLOY_TARGET_DIR}/"
    else
      cp -r dist/* "${DEPLOY_TARGET_DIR}/"
    fi
    echo -e "  ${GREEN}✓ Deployed successfully to ${DEPLOY_TARGET_DIR}.${RESET}"
  fi
elif [ "${DEPLOY_METHOD}" = "ssh" ]; then
  DEPLOY_REMOTE_HOST="${DEPLOY_REMOTE_HOST:?DEPLOY_REMOTE_HOST is required for ssh deploy}"
  DEPLOY_REMOTE_USER="${DEPLOY_REMOTE_USER:?DEPLOY_REMOTE_USER is required for ssh deploy}"
  DEPLOY_REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/var/www/nuclear-valley}"
  DEPLOY_REMOTE_PORT="${DEPLOY_REMOTE_PORT:-22}"

  echo -e "  Deploying via rsync/ssh to ${DEPLOY_REMOTE_USER}@${DEPLOY_REMOTE_HOST}:${DEPLOY_REMOTE_DIR} (Port ${DEPLOY_REMOTE_PORT})..."
  rsync -avz --delete -e "ssh -p ${DEPLOY_REMOTE_PORT}" dist/ "${DEPLOY_REMOTE_USER}@${DEPLOY_REMOTE_HOST}:${DEPLOY_REMOTE_DIR}/"
  echo -e "  ${GREEN}✓ Remote SSH deployment completed.${RESET}"
else
  echo -e "${YELLOW}ℹ Unknown DEPLOY_METHOD='${DEPLOY_METHOD}'; skipped copy step.${RESET}"
fi

# Optional health check verification
if [ -n "${HEALTHCHECK_URL}" ] && command -v curl >/dev/null 2>&1; then
  echo -e "\n${CYAN}▶ Health Check:${RESET} Verifying ${HEALTHCHECK_URL}..."
  if curl -s -f -I -m 5 "${HEALTHCHECK_URL}" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Health check passed (HTTP 200/OK response).${RESET}"
  else
    echo -e "  ${YELLOW}ℹ Service not running at ${HEALTHCHECK_URL} yet (expected if preview server has not started).${RESET}"
  fi
fi

echo -e "\n${GREEN}${BOLD}✓ Deployment completed successfully!${RESET}"

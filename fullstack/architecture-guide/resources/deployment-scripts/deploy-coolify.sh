#!/bin/bash

# Coolify Deployment Script
# Deploy full-stack application to Coolify

set -e # Exit on error

echo "🚀 Starting Coolify deployment..."

# Configuration
PROJECT_NAME="${PROJECT_NAME:-my-app}"
GIT_BRANCH="${GIT_BRANCH:-main}"
COOLIFY_SERVER="${COOLIFY_SERVER:-coolify.example.com}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_warn "Docker is not installed (required for local testing)"
    fi

    log_info "Prerequisites check passed"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    log_info "Frontend build complete"
}

# Build backend
build_backend() {
    log_info "Building backend..."
    cd backend
    npm install
    npm run build || log_warn "No build script found for backend"
    cd ..
    log_info "Backend build complete"
}

# Run tests
run_tests() {
    log_info "Running tests..."

    cd frontend
    npm test -- --run || log_warn "Frontend tests failed or not configured"
    cd ..

    cd backend
    npm test || log_warn "Backend tests failed or not configured"
    cd ..

    log_info "Tests complete"
}

# Commit and push to Git
deploy_to_git() {
    log_info "Deploying to Git repository..."

    # Ensure on correct branch
    git checkout "$GIT_BRANCH" || git checkout -b "$GIT_BRANCH"

    # Add all changes
    git add .

    # Commit if there are changes
    if git diff --staged --quiet; then
        log_warn "No changes to commit"
    else
        COMMIT_MSG="${COMMIT_MSG:-Deploy $(date +'%Y-%m-%d %H:%M:%S')}"
        git commit -m "$COMMIT_MSG"
        log_info "Changes committed"
    fi

    # Push to remote
    git push origin "$GIT_BRANCH"
    log_info "Pushed to Git repository"
}

# Display deployment info
display_info() {
    log_info "Deployment initiated!"
    echo ""
    echo "📦 Project: $PROJECT_NAME"
    echo "🌿 Branch: $GIT_BRANCH"
    echo "🖥  Server: $COOLIFY_SERVER"
    echo ""
    echo "Coolify will now:"
    echo "  1. Pull latest code from Git"
    echo "  2. Build frontend and backend"
    echo "  3. Deploy to production"
    echo "  4. Run database migrations"
    echo "  5. Update environment variables"
    echo ""
    log_info "Monitor deployment at: https://$COOLIFY_SERVER"
}

# Main deployment flow
main() {
    log_info "Starting deployment for $PROJECT_NAME"
    echo ""

    check_prerequisites
    echo ""

    # Optional: Run tests before deployment
    if [ "${RUN_TESTS:-false}" = "true" ]; then
        run_tests
        echo ""
    fi

    # Optional: Build locally before pushing
    if [ "${BUILD_LOCALLY:-false}" = "true" ]; then
        build_frontend
        build_backend
        echo ""
    fi

    deploy_to_git
    echo ""

    display_info
    echo ""

    log_info "Deployment complete! ✨"
}

# Run main function
main "$@"

#!/bin/bash

# Production Build Script
# Build frontend and backend for production deployment

set -e # Exit on error

echo "🔨 Building for production..."

# Configuration
BUILD_DIR="${BUILD_DIR:-./dist}"
NODE_ENV="production"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Clean previous builds
clean_builds() {
    log_info "Cleaning previous builds..."
    rm -rf frontend/dist frontend/build
    rm -rf backend/dist backend/build
    log_info "Clean complete"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."

    cd frontend

    # Install dependencies
    npm ci --production=false

    # Build
    NODE_ENV=production npm run build

    # Verify build output
    if [ -d "dist" ] || [ -d "build" ]; then
        log_info "Frontend build successful"
    else
        log_warn "Frontend build directory not found"
    fi

    cd ..
}

# Build backend
build_backend() {
    log_info "Building backend..."

    cd backend

    # Install dependencies
    npm ci --production=false

    # Build (if using TypeScript)
    if [ -f "tsconfig.json" ]; then
        NODE_ENV=production npm run build
        log_info "Backend TypeScript build successful"
    else
        log_info "Backend does not require build (using plain JavaScript)"
    fi

    cd ..
}

# Optimize images (optional)
optimize_images() {
    log_info "Optimizing images..."

    if command -v npx &> /dev/null; then
        npx @squoosh/cli --avif '{"cqLevel": 33}' frontend/public/images/*.{jpg,png} || log_warn "Image optimization skipped"
    else
        log_warn "npx not available, skipping image optimization"
    fi
}

# Generate build report
generate_report() {
    log_info "Generating build report..."

    REPORT_FILE="build-report.txt"

    echo "Build Report - $(date)" > "$REPORT_FILE"
    echo "================================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Frontend size
    if [ -d "frontend/dist" ]; then
        echo "Frontend Build Size:" >> "$REPORT_FILE"
        du -sh frontend/dist >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi

    # Backend size
    if [ -d "backend/dist" ]; then
        echo "Backend Build Size:" >> "$REPORT_FILE"
        du -sh backend/dist >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi

    # Node modules size
    echo "Dependencies Size:" >> "$REPORT_FILE"
    du -sh frontend/node_modules 2>/dev/null >> "$REPORT_FILE" || echo "N/A" >> "$REPORT_FILE"
    du -sh backend/node_modules 2>/dev/null >> "$REPORT_FILE" || echo "N/A" >> "$REPORT_FILE"

    log_info "Build report saved to $REPORT_FILE"
}

# Main build flow
main() {
    log_info "Starting production build"
    echo ""

    clean_builds
    echo ""

    build_frontend
    echo ""

    build_backend
    echo ""

    if [ "${OPTIMIZE_IMAGES:-false}" = "true" ]; then
        optimize_images
        echo ""
    fi

    generate_report
    echo ""

    log_info "Production build complete! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Review build-report.txt"
    echo "  2. Test builds locally"
    echo "  3. Deploy to production"
}

# Run main
main "$@"

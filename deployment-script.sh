#!/bin/bash
# SEO Workflow System Deployment Script
# Purpose: Automate the deployment of UX enhancements to production
# Usage: ./deploy.sh [environment] [version]
#        environment: 'staging' or 'production' (default: staging)
#        version: version number (default: timestamp)

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration
APP_NAME="seo-workflow-system"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
VERSION=${2:-$TIMESTAMP}
ENVIRONMENT=${1:-"staging"}
DEPLOY_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="./deploy-$TIMESTAMP.log"
SOURCE_DIR="./dist"
CONFIG_DIR="./config"

# Validate environment parameter
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "Error: Environment must be 'staging' or 'production'"
    echo "Usage: ./deploy.sh [environment] [version]"
    exit 1
fi

# Load environment-specific configuration
source "${CONFIG_DIR}/${ENVIRONMENT}.env"

# Initialize log file
echo "=== SEO Workflow System Deployment Log - $TIMESTAMP ===" > "$LOG_FILE"
echo "Environment: $ENVIRONMENT" >> "$LOG_FILE"
echo "Version: $VERSION" >> "$LOG_FILE"
echo "Deployment started at $(date)" >> "$LOG_FILE"

log() {
    local message="$1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $message" | tee -a "$LOG_FILE"
}

# Function to handle errors
handle_error() {
    local exit_code=$?
    log "ERROR: Command failed with exit code $exit_code"
    log "Deployment failed. Rolling back..."
    
    # Restore from backup if it exists
    if [ -d "${BACKUP_DIR}/backup-${TIMESTAMP}" ]; then
        log "Restoring from backup..."
        rsync -a "${BACKUP_DIR}/backup-${TIMESTAMP}/" "${DEPLOY_DIR}/"
        log "Restore completed."
    else
        log "No backup found. Manual intervention required."
    fi
    
    log "Deployment aborted at $(date)"
    exit $exit_code
}

# Set error handler
trap handle_error ERR

# Start deployment
log "Starting deployment of $APP_NAME version $VERSION to $ENVIRONMENT environment"

# Step 1: Build the project
log "Building project..."
npm run build
log "Build completed."

# Step 2: Run tests
log "Running tests..."
npm test
log "Tests completed successfully."

# Step 3: Minify and optimize assets
log "Optimizing assets..."
npm run optimize
log "Optimization completed."

# Step 4: Create backup of current deployment
log "Creating backup..."
mkdir -p "${BACKUP_DIR}/backup-${TIMESTAMP}"
if [ -d "$DEPLOY_DIR" ]; then
    rsync -a "${DEPLOY_DIR}/" "${BACKUP_DIR}/backup-${TIMESTAMP}/"
    log "Backup created at ${BACKUP_DIR}/backup-${TIMESTAMP}"
else
    log "No existing deployment to backup."
    mkdir -p "$DEPLOY_DIR"
fi

# Step 5: Deploy files
log "Deploying files to $DEPLOY_DIR..."
rsync -a --delete \
    --exclude="*.log" \
    --exclude=".git/" \
    --exclude="node_modules/" \
    --exclude="tests/" \
    "${SOURCE_DIR}/" "${DEPLOY_DIR}/"
    
# Step 6: Update configuration files
log "Updating configuration files..."
cp "${CONFIG_DIR}/${ENVIRONMENT}.json" "${DEPLOY_DIR}/config/config.json"
chmod 640 "${DEPLOY_DIR}/config/config.json"  # Restrictive permissions for security

# Step 7: Set correct permissions
log "Setting permissions..."
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
chmod 755 "${DEPLOY_DIR}/scripts/"*.sh

# Step 8: Update version file
echo "{\"version\":\"$VERSION\",\"environment\":\"$ENVIRONMENT\",\"deployedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > "${DEPLOY_DIR}/version.json"

# Step 9: Run post-deployment tasks
log "Running post-deployment tasks..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Production-specific tasks
    log "Clearing cache..."
    curl -X POST "${CACHE_CLEAR_URL}" -H "Authorization: Bearer ${API_TOKEN}" || log "Warning: Cache clear failed, but continuing deployment"
    
    log "Notifying monitoring service..."
    curl -X POST "${MONITORING_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d "{\"app\":\"$APP_NAME\",\"version\":\"$VERSION\",\"environment\":\"$ENVIRONMENT\",\"status\":\"deployed\"}" || log "Warning: Monitoring notification failed"
else
    # Staging-specific tasks
    log "Running database migrations for staging..."
    "${DEPLOY_DIR}/scripts/run-migrations.sh" || log "Warning: Migrations failed, but continuing deployment"
fi

# Step 10: Verify deployment
log "Verifying deployment..."
bash "${DEPLOY_DIR}/scripts/verify-deployment.sh"
VERIFY_STATUS=$?

if [ $VERIFY_STATUS -ne 0 ]; then
    log "ERROR: Deployment verification failed with exit code $VERIFY_STATUS"
    log "Triggering rollback..."
    handle_error
    exit $VERIFY_STATUS
fi

# Step 11: Update symlinks if needed
if [ -L "/var/www/html/$APP_NAME" ]; then
    log "Updating symlink..."
    ln -sf "$DEPLOY_DIR" "/var/www/html/$APP_NAME"
fi

# Step 12: Cleanup old backups (keep last 5)
log "Cleaning up old backups..."
cd "$BACKUP_DIR" && ls -tp | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {}

# Deployment complete
log "Deployment of $APP_NAME version $VERSION to $ENVIRONMENT completed successfully!"
log "Deployment finished at $(date)"

# Print final message
echo ""
echo "===================================================="
echo "      Deployment completed successfully!            "
echo "===================================================="
echo "Application: $APP_NAME"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo "Deployed to: $DEPLOY_DIR"
echo "Log file: $LOG_FILE"
echo ""

exit 0

#!/bin/bash

# DevSight - Start Script
# This script installs dependencies, sets up the database, and starts all essential services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🚀 Starting DevSight setup and launch..."

# Check for required tools
print_status "Checking for required tools..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists pnpm; then
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

# Check Node version
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "📦 Installing dependencies with pnpm..."
pnpm install

# Environment setup
print_status "🔧 Setting up environment..."

if [ ! -f ".env" ]; then
    if [ -f "example.env" ]; then
        print_warning ".env file not found. Copying from example.env..."
        cp example.env .env
        print_warning "⚠️  Please update .env file with your actual values before proceeding!"
        print_warning "   - Set your AUTH_SECRET (generate with: openssl rand -base64 32)"
        print_warning "   - Set your GitHub OAuth credentials (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)"
        print_warning "   - Set your PostgreSQL database URLs"
        print_warning "   - Set your AI API keys (OpenAI, Google, etc.)"
        echo
        read -p "Press Enter to continue after updating .env file, or Ctrl+C to exit..."
    else
        print_error ".env file not found and no example.env to copy from!"
        exit 1
    fi
else
    print_success ".env file found"
fi

# Database setup
print_status "🗄️  Setting up database..."

# Check if Prisma client needs to be generated
if [ ! -d "node_modules/.prisma" ]; then
    print_status "Generating Prisma client..."
    pnpm prisma generate
else
    print_success "Prisma client already generated"
fi

# Enhanced database connectivity check
print_status "Checking database connection and accessibility..."

# First, let's try to generate Prisma client if it's missing to avoid connection issues
print_status "Ensuring Prisma client is ready..."
pnpm prisma generate --silent 2>/dev/null || true

# Test basic connection with timeout using a more reliable approach
print_status "Testing database connection..."
if command_exists gtimeout; then
    TIMEOUT_CMD="gtimeout"
elif command_exists timeout; then
    TIMEOUT_CMD="timeout"
else
    print_warning "No timeout command found, testing without timeout..."
    TIMEOUT_CMD=""
fi

# Try a simple Prisma introspection first (faster than db execute)
print_status "Attempting database introspection..."
if [ -n "$TIMEOUT_CMD" ]; then
    INTROSPECT_TEST=$($TIMEOUT_CMD 15 pnpm prisma db pull --print 2>&1 | head -5)
    INTROSPECT_EXIT=$?
else
    INTROSPECT_TEST=$(pnpm prisma db pull --print 2>&1 | head -5)
    INTROSPECT_EXIT=$?
fi

if [ $INTROSPECT_EXIT -eq 0 ]; then
    print_success "Database introspection successful - connection works!"
    DB_EXIT_CODE=0
else
    print_warning "Introspection failed, trying direct query..."
    # Create a simple connection test
    if [ -n "$TIMEOUT_CMD" ]; then
        DB_CONNECTION_TEST=$($TIMEOUT_CMD 15 pnpm prisma db execute --stdin <<< "SELECT 1 as test;" 2>&1)
        DB_EXIT_CODE=$?
    else
        # Fallback without timeout
        DB_CONNECTION_TEST=$(pnpm prisma db execute --stdin <<< "SELECT 1 as test;" 2>&1)
        DB_EXIT_CODE=$?
    fi
fi

print_status "Connection test result: Exit code $DB_EXIT_CODE"

if [ $DB_EXIT_CODE -eq 0 ]; then
    print_success "✅ Database connection successful"
    
    # Check if database schema exists
    print_status "Verifying database schema..."
    
    # Use a more reliable schema check
    if [ -n "$TIMEOUT_CMD" ]; then
        SCHEMA_CHECK=$($TIMEOUT_CMD 10 pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
    else
        SCHEMA_CHECK=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
    fi
    
    print_status "Found $SCHEMA_CHECK tables in public schema"
    
    if [ "$SCHEMA_CHECK" = "0" ] || [ -z "$SCHEMA_CHECK" ]; then
        print_warning "Database is empty. Setting up initial schema..."
        
        # Push schema to database
        print_status "Pushing Prisma schema to database..."
        pnpm prisma db push --accept-data-loss
        
        # Generate Prisma client after schema push
        print_status "Regenerating Prisma client..."
        pnpm prisma generate
        
        print_success "Database schema created successfully"
    else
        print_success "Database schema exists"
        
        # Check migration status
        print_status "Checking migration status..."
        MIGRATION_STATUS=$(pnpm prisma migrate status 2>&1)
        
        if echo "$MIGRATION_STATUS" | grep -q "Database is up to date"; then
            print_success "Database migrations are up to date"
        elif echo "$MIGRATION_STATUS" | grep -q "following migration.*not yet been applied"; then
            print_status "Applying pending migrations..."
            pnpm prisma migrate deploy
        else
            print_warning "Migration status unclear. Running migrate dev..."
            pnpm prisma migrate dev --name auto_migration_$(date +%Y%m%d_%H%M%S)
        fi
    fi
    
    # Verify tables exist
    print_status "Verifying required tables..."
    
    if [ -n "$TIMEOUT_CMD" ]; then
        TABLES_CHECK=$($TIMEOUT_CMD 10 pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'accounts', 'sessions');" 2>/dev/null || echo "0")
    else
        TABLES_CHECK=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'accounts', 'sessions');" 2>/dev/null || echo "0")
    fi
    
    print_status "Found $TABLES_CHECK auth tables"
    
    if [ "$TABLES_CHECK" -ge "3" ] 2>/dev/null; then
        print_success "All required auth tables exist"
    else
        print_warning "Some auth tables may be missing. This is normal for first-time setup."
    fi
    
else
    print_error "❌ Database connection failed!"
    print_error "Error details: $DB_CONNECTION_TEST"
    echo
    print_status "🔧 Troubleshooting steps:"
    print_warning "  1. Check if your Supabase PostgreSQL database is active"
    print_warning "  2. Verify database URLs in .env are correct:"
    print_warning "     - POSTGRES_PRISMA_URL (with pgbouncer=true)"
    print_warning "     - POSTGRES_URL_NON_POOLING (direct connection)"
    print_warning "  3. Ensure your Supabase project has not been paused"
    print_warning "  4. Check if your IP is allowed in Supabase database settings"
    print_warning "  5. Verify database credentials are still valid"
    print_warning "  6. Check Supabase dashboard for any service issues"
    echo
    
    # Offer to test individual connection strings
    print_status "Would you like to test the connection strings? (y/N):"
    read -r test_connections
    if [[ $test_connections =~ ^[Yy]$ ]]; then
        # Test pooled connection
        print_status "Testing POSTGRES_PRISMA_URL (pooled)..."
        if [ -n "$TIMEOUT_CMD" ]; then
            TEST_RESULT=$($TIMEOUT_CMD 10 pnpm prisma db execute --stdin <<< "SELECT 1;" 2>&1)
            TEST_EXIT=$?
        else
            TEST_RESULT=$(pnpm prisma db execute --stdin <<< "SELECT 1;" 2>&1)
            TEST_EXIT=$?
        fi
        
        if [ $TEST_EXIT -eq 0 ]; then
            print_success "Pooled connection works"
        else
            print_error "Pooled connection failed: $TEST_RESULT"
        fi
        
        # Test direct connection  
        print_status "Testing POSTGRES_URL_NON_POOLING (direct)..."
        TEMP_URL=$POSTGRES_PRISMA_URL
        export POSTGRES_PRISMA_URL=$POSTGRES_URL_NON_POOLING
        
        if [ -n "$TIMEOUT_CMD" ]; then
            TEST_RESULT=$($TIMEOUT_CMD 10 pnpm prisma db execute --stdin <<< "SELECT 1;" 2>&1)
            TEST_EXIT=$?
        else
            TEST_RESULT=$(pnpm prisma db execute --stdin <<< "SELECT 1;" 2>&1)
            TEST_EXIT=$?
        fi
        
        if [ $TEST_EXIT -eq 0 ]; then
            print_success "Direct connection works"
        else
            print_error "Direct connection failed: $TEST_RESULT"
        fi
        export POSTGRES_PRISMA_URL=$TEMP_URL
    fi
    
    echo
    read -p "Would you like to continue anyway? (y/N): " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the application (optional, for production-like testing)
print_status "🔨 Building application..."
if pnpm build; then
    print_success "Build completed successfully"
else
    print_warning "Build failed, but continuing with development server..."
fi

# Start the development server
print_status "🌟 Starting development server..."
print_success "✅ Setup complete! Starting DevSight..."
print_status "📱 Application will be available at: http://localhost:3000"
print_status "🔧 Admin/Database UI available at: http://localhost:5555 (run 'pnpm prisma studio' in another terminal)"

echo
print_status "🎯 Quick commands for development:"
print_status "   • pnpm dev              - Start development server"
print_status "   • pnpm build            - Build for production"
print_status "   • pnpm prisma studio    - Open database admin UI"
print_status "   • pnpm prisma db push   - Push schema changes to database"
print_status "   • pnpm prisma migrate dev - Create and apply new migration"
print_status "   • pnpm prisma db pull   - Pull schema from database"
print_status "   • pnpm prisma generate  - Regenerate Prisma client"
print_status "   • pnpm lint             - Run linter"
echo

# Start the development server
exec pnpm dev

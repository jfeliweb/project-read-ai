#!/bin/bash

# Database Connection Test Script
# This script helps diagnose database connection issues

# Find project root (directory containing package.json)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Try to find project root by looking for package.json
while [ "$PROJECT_ROOT" != "/" ]; do
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        break
    fi
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

# If we didn't find it, try going up from script directory
if [ "$PROJECT_ROOT" == "/" ]; then
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
fi

# Change to project root
cd "$PROJECT_ROOT" || {
    echo "❌ Error: Could not navigate to project root"
    exit 1
}

echo "🔍 Database Connection Diagnostic Tool"
echo "======================================"
echo ""
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if .env.production.local exists
ENV_FILE="$PROJECT_ROOT/.env.production.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.production.local file not found in project root!"
    echo "   Expected location: $ENV_FILE"
    echo "   Create it with: cp .env.example .env.production.local"
    exit 1
fi

echo "✅ Found .env.production.local file"
echo ""

# Extract DATABASE_URL (masking password)
DATABASE_URL=$(grep DATABASE_URL "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.production.local"
    exit 1
fi

echo "📋 Connection String (password masked):"
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:***@/')
echo "   $MASKED_URL"
echo ""

# Parse connection details
# Extract host and port
HOST_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):\([0-9]*\).*/\1:\2/p')
HOST=$(echo "$HOST_PORT" | cut -d ':' -f1)
PORT=$(echo "$HOST_PORT" | cut -d ':' -f2)

echo "🔍 Parsed Connection Details:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo ""

# Check if host is a valid IP or domain
echo "🌐 Network Diagnostics:"
echo ""

# Check if it's an IP address
if [[ $HOST =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "   Format: IP Address detected"
    
    # Check for invalid IP format (leading zeros)
    if [[ $HOST =~ \.[0][0-9] ]]; then
        echo "   ⚠️  WARNING: IP address contains leading zeros!"
        echo "   This is invalid. Example: '15.8.1.048' should be '15.8.1.48'"
        echo "   Please check your .env.production.local file"
    fi
    
    # Validate IP octets
    IFS='.' read -ra ADDR <<< "$HOST"
    INVALID=0
    for i in "${ADDR[@]}"; do
        if [ "$i" -gt 255 ] || [ "$i" -lt 0 ]; then
            INVALID=1
        fi
    done
    
    if [ $INVALID -eq 1 ]; then
        echo "   ❌ ERROR: Invalid IP address format!"
        echo "   Each octet must be between 0-255"
    else
        echo "   ✅ IP address format is valid"
    fi
else
    echo "   Format: Domain name detected"
fi

echo ""

# Test basic connectivity
echo "🔌 Testing Connectivity:"
echo ""

# Check if port is specified
if [ -z "$PORT" ]; then
    echo "   ⚠️  No port specified, using default 5432"
    PORT=5432
fi

# Test if host is reachable (ping)
if command -v ping &> /dev/null; then
    echo "   Testing host reachability..."
    if ping -c 1 -W 2 "$HOST" &> /dev/null; then
        echo "   ✅ Host is reachable (ping successful)"
    else
        echo "   ❌ Host is NOT reachable (ping failed)"
        echo "   This could mean:"
        echo "      - Host is down"
        echo "      - Firewall is blocking ICMP"
        echo "      - Wrong IP address"
    fi
else
    echo "   ⚠️  ping command not available"
fi

echo ""

# Test port connectivity
echo "   Testing port $PORT connectivity..."
if command -v nc &> /dev/null || command -v netcat &> /dev/null; then
    NC_CMD=$(command -v nc || command -v netcat)
    if timeout 5 $NC_CMD -zv "$HOST" "$PORT" 2>&1 | grep -q "succeeded\|open"; then
        echo "   ✅ Port $PORT is open and accepting connections"
    else
        echo "   ❌ Port $PORT is NOT accessible"
        echo "   This could mean:"
        echo "      - PostgreSQL is not running"
        echo "      - Firewall is blocking port $PORT"
        echo "      - PostgreSQL is not listening on this IP"
        echo "      - Wrong port number"
    fi
elif command -v telnet &> /dev/null; then
    if timeout 3 telnet "$HOST" "$PORT" 2>&1 | grep -q "Connected"; then
        echo "   ✅ Port $PORT is open"
    else
        echo "   ❌ Port $PORT is NOT accessible"
    fi
else
    echo "   ⚠️  nc/netcat/telnet not available for port testing"
fi

echo ""

# Test PostgreSQL connection
echo "🐘 Testing PostgreSQL Connection:"
echo ""

if command -v psql &> /dev/null; then
    echo "   Attempting to connect with psql..."
    if timeout 10 psql "$DATABASE_URL" -c "SELECT version();" 2>&1 | grep -q "PostgreSQL\|version"; then
        echo "   ✅ PostgreSQL connection successful!"
        psql "$DATABASE_URL" -c "SELECT version();" 2>&1 | head -3
    else
        ERROR=$(timeout 10 psql "$DATABASE_URL" -c "SELECT 1;" 2>&1)
        echo "   ❌ PostgreSQL connection failed:"
        echo "   $ERROR" | head -5
    fi
else
    echo "   ⚠️  psql not installed, skipping direct PostgreSQL test"
    echo "   Install with: brew install postgresql (macOS) or apt-get install postgresql-client (Linux)"
fi

echo ""
echo "======================================"
echo "💡 Troubleshooting Tips:"
echo ""
echo "1. Verify your IP address is correct (no leading zeros)"
echo "2. Check if PostgreSQL is running on the server"
echo "3. Verify firewall rules allow port $PORT from your IP"
echo "4. Check if PostgreSQL is listening on the correct interface"
echo "5. For self-hosted Supabase, check Supabase configuration"
echo ""
echo "Common fixes:"
echo "  - Remove leading zeros from IP: 15.8.1.048 → 15.8.1.48"
echo "  - Check pg_hba.conf allows your connection"
echo "  - Verify PostgreSQL is listening: sudo netstat -tlnp | grep 5432"
echo "  - Check firewall: sudo ufw status"
echo ""


#!/bin/bash
echo "========================================="
echo "AUTH MODULE FILE CHECKER"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# Check all required auth files
echo "📁 Checking src/auth/ directory..."
check_file "src/auth/auth.module.ts"
check_file "src/auth/auth.controller.ts"
check_file "src/auth/auth.service.ts"
check_file "src/auth/auth.repository.ts"
check_file "src/auth/auth.interface.ts"

echo ""
echo "📁 Checking src/auth/guards/ directory..."
check_file "src/auth/guards/jwt-auth.guard.ts"
check_file "src/auth/guards/roles.guard.ts"

echo ""
echo "📁 Checking src/auth/decorators/ directory..."
check_file "src/auth/decorators/public.decorator.ts"
check_file "src/auth/decorators/roles.decorator.ts"
check_file "src/auth/decorators/current-user.decorator.ts"

echo ""
echo "📁 Checking src/auth/interfaces/ directory..."
check_file "src/auth/interfaces/jwt-payload.interface.ts"
check_file "src/auth/interfaces/authenticated-user.interface.ts"
check_file "src/auth/interfaces/auth-tokens.interface.ts"

echo ""
echo "📁 Checking src/auth/strategies/ directory..."
check_file "src/auth/strategies/role-policy.ts"

echo ""
echo "📁 Checking src/auth/dto/ directory..."
check_file "src/auth/dto/login.dto.ts"
check_file "src/auth/dto/refresh-token.dto.ts"
check_file "src/auth/dto/change-password.dto.ts"
check_file "src/auth/dto/forgot-password.dto.ts"
check_file "src/auth/dto/reset-password.dto.ts"

echo ""
echo "📁 Checking src/common/auth/ directory (existing guards)..."
if [ -d "src/common/auth" ]; then
    echo -e "${YELLOW}📂 Files found in common/auth:${NC}"
    ls -la src/common/auth/*.ts 2>/dev/null | awk '{print "   " $9}'
else
    echo -e "${RED}❌ src/common/auth directory not found${NC}"
fi

echo ""
echo "========================================="
echo "Summary:"
echo "========================================="

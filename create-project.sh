#!/bin/bash

# ─── Configuration ────────────────────────────────────────────────────────────

set -e

PROJECT_NAME="citycare-hospital-dashboard"
ROOT_PATH="${PWD}/${PROJECT_NAME}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ─── Color Functions ──────────────────────────────────────────────────────────

success() { echo -e "${GREEN}[✓] $*${NC}"; }
error() { echo -e "${RED}[✗] $*${NC}"; }
info() { echo -e "${CYAN}[i] $*${NC}"; }
warning() { echo -e "${YELLOW}[!] $*${NC}"; }
section() { echo -e "\n${MAGENTA}═══════════════════════════════════════════════════${NC}"; echo -e "${MAGENTA}$*${NC}"; echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}"; }

# ─── Banner ──────────────────────────────────────────────────────────────────

clear
section "    CityCare Hospital Admin Dashboard"
section "    Project Structure Generator v1.0.0"
echo ""

# ─── Check if project exists ─────────────────────────────────────────────────

if [ -d "$ROOT_PATH" ]; then
    warning "Project directory already exists: $ROOT_PATH"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Operation cancelled by user."
        exit 0
    fi
    info "Removing existing directory..."
    rm -rf "$ROOT_PATH"
fi

# ─── Create root directory ───────────────────────────────────────────────────

info "Creating project root directory..."
mkdir -p "$ROOT_PATH"
cd "$ROOT_PATH"
success "Project root created"

# ─── Helper Functions ────────────────────────────────────────────────────────

create_file() {
    local file_path="$1"
    local content="$2"
    local dir_path=$(dirname "$file_path")
    
    if [ ! -d "$dir_path" ]; then
        mkdir -p "$dir_path"
    fi
    
    echo "$content" > "$file_path"
    success "Created: $file_path"
}

create_dir() {
    local dir_path="$1"
    if [ ! -d "$dir_path" ]; then
        mkdir -p "$dir_path"
        success "Created: $dir_path/"
    fi
}

# ─── Create Root Configuration Files ────────────────────────────────────────

section "Creating root configuration files..."

# .env.local
create_file ".env.local" \
"NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CityCare Hospital
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/citycare
REDIS_URL=redis://localhost:6379"

# .eslintrc.json
create_file ".eslintrc.json" \
'{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react/display-name": "off"
  }
}'

# .prettierrc
create_file ".prettierrc" \
'{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}'

# .gitignore
create_file ".gitignore" \
'# Dependencies
node_modules/
.pnp/
.pnp.js

# Next.js
.next/
out/
dist/

# Production
build/
dist/

# Environment variables
.env.local
.env.*.local
.env

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
Thumbs.db
Desktop.ini

# Testing
.vercel
.turbo'

# next.config.js
create_file "next.config.js" \
'/** @type {import('\''next'\'').NextConfig} */
const nextConfig = {
  images: {
    domains: ['\''localhost'\'', '\''storage.googleapis.com'\''],
    formats: ['\''image/avif'\'', '\''image/webp'\''],
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === '\''production'\'',
  },
  experimental: {
    optimizePackageImports: ['\''lucide-react'\'', '\''recharts'\''],
  },
};

module.exports = nextConfig;'

# package.json
create_file "package.json" \
'{
  "name": "citycare-hospital-dashboard",
  "version": "1.0.0",
  "description": "CityCare Hospital Admin Dashboard",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "recharts": "2.8.0",
    "clsx": "2.0.0",
    "tailwind-merge": "2.0.0",
    "lucide-react": "0.294.0",
    "date-fns": "2.30.0",
    "zod": "3.22.4",
    "react-hook-form": "7.48.0",
    "@hookform/resolvers": "3.3.2",
    "react-hot-toast": "2.4.1"
  },
  "devDependencies": {
    "@types/node": "20.10.4",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "@typescript-eslint/eslint-plugin": "6.14.0",
    "@typescript-eslint/parser": "6.14.0",
    "autoprefixer": "10.4.16",
    "eslint": "8.55.0",
    "eslint-config-next": "14.0.4",
    "jest": "29.7.0",
    "@types/jest": "29.5.11",
    "postcss": "8.4.32",
    "prettier": "3.1.1",
    "tailwindcss": "3.3.6",
    "typescript": "5.3.3"
  }
}'

# tailwind.config.js
create_file "tailwind.config.js" \
'/** @type {import('\''tailwindcss'\'').Config} */
module.exports = {
  content: [
    '\''./src/pages/**/*.{js,ts,jsx,tsx,mdx}'\'',
    '\''./src/components/**/*.{js,ts,jsx,tsx,mdx}'\'',
    '\''./src/app/**/*.{js,ts,jsx,tsx,mdx}'\'',
  ],
  theme: {
    extend: {
      colors: {
        '\''info-bg'\'': '\''#DBEAFE'\'',
        info: '\''#2563EB'\'',
        '\''success-bg'\'': '\''#DCFCE7'\'',
        success: '\''#16A34A'\'',
        '\''warning-bg'\'': '\''#FFEDD5'\'',
        warning: '\''#EA580C'\'',
        '\''danger-bg'\'': '\''#FEE2E2'\'',
        danger: '\''#DC2626'\'',
        page: '\''#F5F6FA'\'',
        surface: '\''#FFFFFF'\'',
        sidebar: '\''#0F1B3D'\'',
        border: '\''#E5E7EB'\'',
        '\''text-primary'\'': '\''#111827'\'',
        '\''text-secondary'\'': '\''#6B7280'\'',
        '\''text-tertiary'\'': '\''#9CA3AF'\'',
      },
      spacing: {
        1: '\''4px'\'',
        2: '\''8px'\'',
        3: '\''12px'\'',
        4: '\''16px'\'',
        6: '\''24px'\'',
        8: '\''32px'\'',
        12: '\''48px'\'',
      },
      fontSize: {
        display: '\''24px'\'',
        heading: '\''17px'\'',
        stat: '\''30px'\'',
        body: '\''14px'\'',
        label: '\''13px'\'',
        delta: '\''12px'\'',
      },
      fontWeight: {
        display: '\''600'\'',
        heading: '\''600'\'',
        stat: '\''700'\'',
        body: '\''400'\'',
        label: '\''400'\'',
        delta: '\''500'\'',
      },
      borderRadius: {
        card: '\''12px'\'',
        badge: '\''8px'\'',
        pill: '\''9999px'\'',
      },
      fontFamily: {
        sans: ['\''Inter'\'', '\''system-ui'\'', '\''sans-serif'\''],
      },
    },
  },
  plugins: [],
};'

# tsconfig.json
create_file "tsconfig.json" \
'{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}'

# postcss.config.js
create_file "postcss.config.js" \
'module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};'

# ─── Create Directory Structure ─────────────────────────────────────────────

section "Creating directory structure..."

declare -a DIRECTORIES=(
    "src/app/(auth)/login"
    "src/app/(dashboard)/admin/[id]"
    "src/app/(dashboard)/billing"
    "src/app/(dashboard)/feature-flags"
    "src/app/(dashboard)/settings"
    "src/app/(dashboard)/system-monitor"
    "src/app/(dashboard)/tenants/[id]"
    "src/app/api/admin/billing/invoices/[id]/mark-paid"
    "src/app/api/admin/billing/invoices/[id]/remind"
    "src/app/api/admin/billing/plans/[id]"
    "src/app/api/admin/billing/summary"
    "src/app/api/admin/billing/transactions/export"
    "src/app/api/billing/subscription/[tenantId]/cancel"
    "src/app/api/billing/subscription/[tenantId]/pause"
    "src/app/api/billing/subscription/[tenantId]/resume"
    "src/app/api/feature-flags/[id]/global"
    "src/app/api/feature-flags/[id]/tenants/[tenantId]"
    "src/app/api/super-admin/admins"
    "src/app/api/super-admin/system-monitor"
    "src/app/api/tenants/[id]/activate"
    "src/app/api/tenants/[id]/suspend"
    "src/components/common"
    "src/components/layout"
    "src/components/dashboard"
    "src/components/admin"
    "src/components/tenants"
    "src/components/billing"
    "src/components/feature-flags"
    "src/components/system-monitor"
    "src/hooks"
    "src/lib/api"
    "src/lib/constants"
    "src/lib/utils"
    "src/lib/design-tokens"
    "src/lib/hooks"
    "src/types"
    "src/contexts"
    "src/styles"
    "public/images"
    "tests/unit/components"
    "tests/unit/utils"
    "tests/integration"
    "tests/e2e"
    "docs"
)

for dir in "${DIRECTORIES[@]}"; do
    create_dir "$dir"
done

# ─── Create Application Files ───────────────────────────────────────────────

section "Creating application files..."

# src/app/layout.tsx
create_file "src/app/layout.tsx" \
"import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CityCare Hospital Admin Dashboard',
  description: 'Hospital administration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang=\"en\">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}"

# src/app/globals.css
create_file "src/app/globals.css" \
"@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-page text-text-primary antialiased;
  }
}"

# src/app/providers.tsx
create_file "src/app/providers.tsx" \
"'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position=\"top-right\"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#111827',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
          },
        }}
      />
    </ThemeProvider>
  );
}"

# src/app/(dashboard)/layout.tsx
create_file "src/app/(dashboard)/layout.tsx" \
"'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className=\"flex h-screen overflow-hidden\">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className=\"flex-1 flex flex-col overflow-hidden\">
        <Header />
        <main className=\"flex-1 overflow-y-auto p-6 bg-page\">
          {children}
        </main>
      </div>
    </div>
  );
}"

# src/app/(dashboard)/page.tsx
create_file "src/app/(dashboard)/page.tsx" \
"'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function DashboardPage() {
  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-start justify-between\">
        <div>
          <h1 className=\"text-display font-display text-text-primary\">
            Hospital Admin Dashboard
          </h1>
          <p className=\"text-body text-text-secondary mt-1\">
            Welcome back! Here's what's happening with your hospital today.
          </p>
        </div>
        <Button variant=\"primary\" size=\"sm\">
          + Generate Report
        </Button>
      </div>

      <div className=\"grid grid-cols-12 gap-6\">
        <div className=\"col-span-12\">
          <Card title=\"Quick Stats\" subtitle=\"Real-time hospital metrics\">
            <div className=\"grid grid-cols-2 md:grid-cols-5 gap-4\">
              {[
                { label: 'Total Employees', value: '1,248', color: 'text-info' },
                { label: 'Present Today', value: '986', color: 'text-success' },
                { label: 'On Leave', value: '142', color: 'text-warning' },
                { label: 'Absent', value: '120', color: 'text-danger' },
                { label: 'Overtime', value: '48', color: 'text-info' },
              ].map((stat) => (
                <div key={stat.label} className=\"bg-page rounded-lg p-4\">
                  <p className=\"text-label text-text-secondary\">{stat.label}</p>
                  <p className=\"text-stat font-stat ${stat.color}\">{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className=\"grid grid-cols-12 gap-6\">
        <div className=\"col-span-7\">
          <Card title=\"Attendance Overview\" subtitle=\"Weekly trend\">
            <div className=\"h-64 flex items-center justify-center text-text-secondary\">
              Chart placeholder - Attendance data
            </div>
          </Card>
        </div>
        <div className=\"col-span-5\">
          <Card title=\"Recent Alerts\" subtitle=\"Requires attention\">
            <div className=\"space-y-3\">
              {[
                { message: 'Staff shortage in ER', time: '10 min ago', severity: 'danger' },
                { message: 'Payroll processing delay', time: '1 hour ago', severity: 'warning' },
                { message: 'New leave requests pending', time: '3 hours ago', severity: 'info' },
              ].map((alert, i) => (
                <div key={i} className=\"flex items-center justify-between p-3 bg-page rounded-lg\">
                  <div className=\"flex items-center gap-3\">
                    <div className={\`w-2 h-2 rounded-full bg-\${alert.severity}\`} />
                    <span className=\"text-sm\">{alert.message}</span>
                  </div>
                  <span className=\"text-xs text-text-tertiary\">{alert.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}"

# ─── Create Component Files ─────────────────────────────────────────────────

section "Creating component files..."

# src/components/common/Button.tsx
create_file "src/components/common/Button.tsx" \
"import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-info text-white hover:bg-info/90 focus:ring-info/50',
      secondary: 'bg-text-secondary text-white hover:bg-text-secondary/90 focus:ring-text-secondary/50',
      outline: 'border border-border bg-transparent text-text-primary hover:bg-page hover:border-text-secondary focus:ring-info/50',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-page focus:ring-info/50',
      danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/50',
      success: 'bg-success text-white hover:bg-success/90 focus:ring-success/50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className=\"animate-spin h-4 w-4\" viewBox=\"0 0 24 24\">
            <circle
              className=\"opacity-25\"
              cx=\"12\"
              cy=\"12\"
              r=\"10\"
              stroke=\"currentColor\"
              strokeWidth=\"4\"
              fill=\"none\"
            />
            <path
              className=\"opacity-75\"
              fill=\"currentColor\"
              d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"
            />
          </svg>
        )}
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';"

# src/components/common/Card.tsx
create_file "src/components/common/Card.tsx" \
"import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  hover?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
  footer,
  onClick,
  hover = false,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
}: CardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-card border border-border bg-surface shadow-sm p-6',
          className
        )}
      >
        <div className=\"animate-pulse space-y-4\">
          <div className=\"h-4 bg-page rounded w-1/4\" />
          <div className=\"h-20 bg-page rounded\" />
          <div className=\"h-4 bg-page rounded w-1/3\" />
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          'rounded-card border border-border bg-surface shadow-sm p-12 text-center',
          className
        )}
      >
        <p className=\"text-text-secondary\">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-sm',
        'flex flex-col',
        hover && 'hover:shadow-md hover:border-info/30 transition-all cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle || action) && (
        <div className=\"flex items-start justify-between gap-4 p-6 pb-0\">
          <div className=\"flex-1\">
            {title && <h3 className=\"text-heading font-heading text-text-primary\">{title}</h3>}
            {subtitle && <p className=\"text-body text-text-secondary mt-1\">{subtitle}</p>}
          </div>
          {action && <div className=\"shrink-0\">{action}</div>}
        </div>
      )}
      <div className=\"flex-1 p-6\">{children}</div>
      {footer && <div className=\"border-t border-border p-4\">{footer}</div>}
    </div>
  );
}"

# src/components/layout/Sidebar.tsx
create_file "src/components/layout/Sidebar.tsx" \
"'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { navigation } from '@/lib/constants/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-sidebar text-white transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className=\"p-4 border-b border-white/10\">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2')}>
          <span className=\"text-2xl\">🏥</span>
          {!collapsed && <span className=\"font-bold\">CityCare</span>}
        </div>
      </div>
      <nav className=\"flex-1 p-2 space-y-1\">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              pathname === item.href
                ? 'bg-info text-white'
                : 'text-gray-300 hover:bg-white/10',
              collapsed && 'justify-center'
            )}
          >
            <span className=\"text-xl\">{item.icon}</span>
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
      <button
        onClick={onToggle}
        className=\"p-4 border-t border-white/10 text-gray-400 hover:text-white transition-colors\"
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
}"

# src/components/layout/Header.tsx
create_file "src/components/layout/Header.tsx" \
"'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';

export function Header() {
  const [dateRange, setDateRange] = useState('This Month');

  return (
    <header className=\"bg-surface border-b border-border px-6 py-4 flex items-center justify-between\">
      <div>
        <h2 className=\"text-heading font-heading text-text-primary\">Dashboard</h2>
        <p className=\"text-label text-text-secondary\">Overview of hospital operations</p>
      </div>
      <div className=\"flex items-center gap-4\">
        <Button variant=\"outline\" size=\"sm\">
          {dateRange}
        </Button>
        <button className=\"relative\">
          <span className=\"text-xl\">🔔</span>
          <span className=\"absolute -top-1 -right-1 h-4 w-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center\">3</span>
        </button>
        <div className=\"flex items-center gap-2\">
          <div className=\"h-8 w-8 rounded-full bg-info-bg text-info flex items-center justify-center font-semibold\">
            JD
          </div>
          <div className=\"hidden md:block\">
            <p className=\"text-sm font-medium\">John Doe</p>
            <p className=\"text-xs text-text-secondary\">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}"

# ─── Create TypeScript Type Files ────────────────────────────────────────────

section "Creating TypeScript type definitions..."

# src/types/common.ts
create_file "src/types/common.ts" \
"export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Status = 'active' | 'inactive' | 'pending';
export type Severity = 'info' | 'warning' | 'error' | 'success';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  success: boolean;
}"

# src/types/admin.ts
create_file "src/types/admin.ts" \
"export type AdminRole = 'super_admin' | 'hospital_admin' | 'hr_manager' | 'auditor';
export type AdminStatus = 'active' | 'inactive' | 'pending';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  tenantId: string;
  lastLogin: string;
  joinedAt: string;
  avatarInitials: string;
}"

# src/types/tenant.ts
create_file "src/types/tenant.ts" \
"export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  trialEndsAt?: string | null;
  country: string;
  lastActive: string;
  contactName?: string | null;
  notes?: string | null;
}"

# src/types/feature-flags.ts
create_file "src/types/feature-flags.ts" \
"export type FlagCategory = 'attendance' | 'notifications' | 'auth' | 'reporting' | 'experimental';
export type RolloutStrategy = 'global' | 'per_tenant' | 'percentage';

export interface TenantOverride {
  tenantId: string;
  enabled: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: FlagCategory;
  strategy: RolloutStrategy;
  globalEnabled: boolean;
  percentage?: number;
  tenantOverrides: TenantOverride[];
  lastModified: string;
  modifiedBy: string;
  stable: boolean;
}"

# ─── Create Utility Files ────────────────────────────────────────────────────

section "Creating utility files..."

# src/lib/utils/cn.ts
create_file "src/lib/utils/cn.ts" \
"import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}"

# src/lib/utils/formatting.ts
create_file "src/lib/utils/formatting.ts" \
"export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return \`\${Math.floor(diff / 60)}m ago\`;
  if (diff < 86400) return \`\${Math.floor(diff / 3600)}h ago\`;
  if (diff < 604800) return \`\${Math.floor(diff / 86400)}d ago\`;
  return formatDate(d);
}"

# src/lib/constants/navigation.ts
create_file "src/lib/constants/navigation.ts" \
"export const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    section: 'Main',
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: '🏥',
    section: 'Management',
  },
  {
    title: 'Admins',
    href: '/admin',
    icon: '👤',
    section: 'Management',
  },
  {
    title: 'Feature Flags',
    href: '/feature-flags',
    icon: '🚩',
    section: 'Management',
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: '💰',
    section: 'Finance',
  },
  {
    title: 'System Monitor',
    href: '/system-monitor',
    icon: '📈',
    section: 'System',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: '⚙️',
    section: 'System',
  },
];"

# src/lib/design-tokens/index.ts
create_file "src/lib/design-tokens/index.ts" \
"export const colors = {
  semantic: {
    info: { bg: '#DBEAFE', text: '#2563EB', border: '#2563EB' },
    success: { bg: '#DCFCE7', text: '#16A34A', border: '#16A34A' },
    warning: { bg: '#FFEDD5', text: '#EA580C', border: '#EA580C' },
    danger: { bg: '#FEE2E2', text: '#DC2626', border: '#DC2626' },
  },
  neutral: {
    page: '#F5F6FA',
    surface: '#FFFFFF',
    sidebar: '#0F1B3D',
    border: '#E5E7EB',
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
  },
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
} as const;

export const typography = {
  display: { size: '24px', weight: 600 },
  heading: { size: '17px', weight: 600 },
  stat: { size: '30px', weight: 700 },
  body: { size: '14px', weight: 400 },
  label: { size: '13px', weight: 400 },
  delta: { size: '12px', weight: 500 },
} as const;"

# src/contexts/ThemeContext.tsx
create_file "src/contexts/ThemeContext.tsx" \
"'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}"

# ─── Create Documentation ────────────────────────────────────────────────────

section "Creating documentation..."

# README.md
create_file "README.md" \
"# 🏥 CityCare Hospital Admin Dashboard

A comprehensive hospital administration platform built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

- **📊 Dashboard**: Real-time KPIs, attendance tracking, and alerts
- **🏥 Tenant Management**: Multi-hospital account management
- **👤 Admin Management**: Role-based access control
- **🚩 Feature Flags**: Progressive feature rollout
- **💰 Billing**: Subscription and revenue management
- **📈 System Monitor**: Infrastructure health monitoring

## 🚀 Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Data visualization
- [Lucide React](https://lucide.dev/) - Icons
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation

## 📦 Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   └── (dashboard)/    # Dashboard routes
├── components/          # React components
│   ├── common/         # Reusable components
│   └── layout/         # Layout components
├── lib/                 # Utilities and configurations
│   ├── api/            # API client
│   ├── constants/      # Constants
│   └── utils/          # Helper functions
├── types/              # TypeScript type definitions
└── contexts/           # React contexts
\`\`\`

## 🎨 Design System

The dashboard uses a semantic color system:

- **Blue** (#2563EB) - Informational
- **Green** (#16A34A) - Positive/Success
- **Amber** (#EA580C) - Warning/Caution
- **Red** (#DC2626) - Negative/Danger

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📝 License

MIT © CityCare Development Team"

# ─── Final Output ────────────────────────────────────────────────────────────

section ""
success "Project structure created successfully!"
section ""
echo ""
echo -e "${GREEN}📁 Project Location:${NC} $ROOT_PATH"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  ${CYAN}1. cd $PROJECT_NAME${NC}"
echo -e "  ${CYAN}2. npm install${NC}"
echo -e "  ${CYAN}3. npm run dev${NC}"
echo ""
echo -e "${GREEN}📊 Dashboard will be available at: http://localhost:3000${NC}"
echo ""
echo -e "${MAGENTA}Happy coding! 🚀${NC}"
echo ""

# Open the project in file manager
if command -v nautilus &> /dev/null; then
    nautilus "$ROOT_PATH" &> /dev/null &
elif command -v dolphin &> /dev/null; then
    dolphin "$ROOT_PATH" &> /dev/null &
elif command -v explorer.exe &> /dev/null; then
    explorer.exe "$ROOT_PATH" &> /dev/null &
fi

# Open VS Code if installed
if command -v code &> /dev/null; then
    echo -e "${CYAN}Opening VS Code...${NC}"
    code "$ROOT_PATH"
fi
#!/bin/bash

# =============================================================================
# Chronos Super Admin Scaffold Script
# Run from: ~/Desktop/hclockin-system/
# Usage: bash scaffold-super-admin.sh
# =============================================================================

set -e

ROOT=$(pwd)
BACKEND="$ROOT/apps/backend-api"
FRONTEND="$ROOT/apps/web-frontend"
TYPES="$ROOT/packages/types-common"
DATABASE="$ROOT/packages/database"

echo "🏥 Chronos Super Admin Scaffold"
echo "================================"
echo "Root:     $ROOT"
echo "Backend:  $BACKEND"
echo "Frontend: $FRONTEND"
echo "Types:    $TYPES"
echo "Database: $DATABASE"
echo ""

# Guard: must run from monorepo root
if [ ! -f "$ROOT/turbo.json" ]; then
  echo "❌ ERROR: Run this script from the monorepo root (where turbo.json lives)"
  exit 1
fi

echo "✅ Monorepo root confirmed"
echo ""

# =============================================================================
# 1. SHARED TYPES — packages/types-common/src/super-admin/
# =============================================================================
echo "📦 Creating shared types..."

mkdir -p "$TYPES/src/super-admin"

cat > "$TYPES/src/super-admin/tenant.types.ts" << 'EOF'
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  billingCycle: BillingCycle;
  staffCount: number;
  adminEmail: string;
  createdAt: string;
  trialEndsAt?: string;
  suspendedAt?: string;
  suspendReason?: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  adminEmail: string;
  adminName: string;
  plan: PlanTier;
  billingCycle: BillingCycle;
  trialDays?: number;
}

export interface UpdateTenantDto {
  name?: string;
  status?: TenantStatus;
  plan?: PlanTier;
  billingCycle?: BillingCycle;
  suspendReason?: string;
}
EOF

cat > "$TYPES/src/super-admin/plan.types.ts" << 'EOF'
export interface PlanFeatures {
  maxStaff: number;
  maxDepartments: number;
  smsNotifications: boolean;
  emailNotifications: boolean;
  advancedReports: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  multiSite: boolean;
  ssoIntegration: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: string;
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeatures;
}
EOF

cat > "$TYPES/src/super-admin/platform-stats.types.ts" << 'EOF'
export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  totalStaff: number;
  totalClockInsToday: number;
  mrr: number;
  arr: number;
  churnRate: number;
  newTenantsThisMonth: number;
}

export interface TenantActivity {
  tenantId: string;
  tenantName: string;
  lastActivityAt: string;
  clockInsToday: number;
  activeStaff: number;
}
EOF

cat > "$TYPES/src/super-admin/impersonation.types.ts" << 'EOF'
export interface ImpersonationSession {
  superAdminId: string;
  targetTenantId: string;
  targetTenantName: string;
  targetAdminEmail: string;
  sessionToken: string;
  startedAt: string;
  expiresAt: string;
}

export interface ImpersonationLog {
  id: string;
  superAdminId: string;
  tenantId: string;
  tenantName: string;
  startedAt: string;
  endedAt?: string;
  reason: string;
}
EOF

cat > "$TYPES/src/super-admin/index.ts" << 'EOF'
export * from './tenant.types';
export * from './plan.types';
export * from './platform-stats.types';
export * from './impersonation.types';
EOF

echo "   ✓ packages/types-common/src/super-admin/"

# =============================================================================
# 2. BACKEND — apps/backend-api/src/super-admin/
# =============================================================================
echo "🔧 Creating backend NestJS module..."

SA_BACKEND="$BACKEND/src/super-admin"
mkdir -p "$SA_BACKEND/guards"
mkdir -p "$SA_BACKEND/tenants"
mkdir -p "$SA_BACKEND/plans"
mkdir -p "$SA_BACKEND/impersonation"
mkdir -p "$SA_BACKEND/platform-stats"
mkdir -p "$SA_BACKEND/feature-flags"

# Module root
cat > "$SA_BACKEND/super-admin.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { PlansModule } from './plans/plans.module';
import { ImpersonationModule } from './impersonation/impersonation.module';
import { PlatformStatsModule } from './platform-stats/platform-stats.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';

@Module({
  imports: [
    TenantsModule,
    PlansModule,
    ImpersonationModule,
    PlatformStatsModule,
    FeatureFlagsModule,
  ],
})
export class SuperAdminModule {}
EOF

# Super Admin Guard
cat > "$SA_BACKEND/guards/super-admin.guard.ts" << 'EOF'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Super admin access required');
    }
    return true;
  }
}
EOF

# Tenants controller
cat > "$SA_BACKEND/tenants/tenants.controller.ts" << 'EOF'
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { TenantsService } from './tenants.service';

@Controller('super-admin/tenants')
@UseGuards(SuperAdminGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('plan') plan?: string) {
    return this.tenantsService.findAll({ status, plan });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.tenantsService.update(id, dto);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.tenantsService.suspend(id, reason);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.tenantsService.reactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
EOF

cat > "$SA_BACKEND/tenants/tenants.service.ts" << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
// TODO: inject PrismaService from packages/database

@Injectable()
export class TenantsService {
  async findAll(filters: { status?: string; plan?: string }) {
    // TODO: return prisma.tenant.findMany({ where: filters })
    return [];
  }

  async findOne(id: string) {
    // TODO: return prisma.tenant.findUniqueOrThrow({ where: { id } })
    return null;
  }

  async create(dto: any) {
    // TODO: prisma.tenant.create + create default admin account
    return null;
  }

  async update(id: string, dto: any) {
    // TODO: prisma.tenant.update
    return null;
  }

  async suspend(id: string, reason: string) {
    // TODO: prisma.tenant.update({ status: SUSPENDED, suspendReason: reason })
    return null;
  }

  async reactivate(id: string) {
    // TODO: prisma.tenant.update({ status: ACTIVE })
    return null;
  }

  async remove(id: string) {
    // TODO: soft delete
    return null;
  }
}
EOF

cat > "$SA_BACKEND/tenants/tenants.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
EOF

# Platform Stats
cat > "$SA_BACKEND/platform-stats/platform-stats.controller.ts" << 'EOF'
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { PlatformStatsService } from './platform-stats.service';

@Controller('super-admin/stats')
@UseGuards(SuperAdminGuard)
export class PlatformStatsController {
  constructor(private readonly statsService: PlatformStatsService) {}

  @Get()
  getStats() {
    return this.statsService.getPlatformStats();
  }

  @Get('mrr')
  getMrr() {
    return this.statsService.getMrrBreakdown();
  }

  @Get('activity')
  getActivity() {
    return this.statsService.getRecentActivity();
  }
}
EOF

cat > "$SA_BACKEND/platform-stats/platform-stats.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformStatsService {
  async getPlatformStats() {
    // TODO: aggregate from prisma
    return {};
  }

  async getMrrBreakdown() {
    // TODO: group tenants by plan, sum prices
    return {};
  }

  async getRecentActivity() {
    // TODO: recent clock-ins, new tenants, etc.
    return [];
  }
}
EOF

cat > "$SA_BACKEND/platform-stats/platform-stats.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { PlatformStatsController } from './platform-stats.controller';
import { PlatformStatsService } from './platform-stats.service';

@Module({
  controllers: [PlatformStatsController],
  providers: [PlatformStatsService],
})
export class PlatformStatsModule {}
EOF

# Impersonation
cat > "$SA_BACKEND/impersonation/impersonation.controller.ts" << 'EOF'
import { Controller, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ImpersonationService } from './impersonation.service';

@Controller('super-admin/impersonate')
@UseGuards(SuperAdminGuard)
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @Post(':tenantId')
  startImpersonation(
    @Param('tenantId') tenantId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.impersonationService.start(req.user.id, tenantId, reason);
  }

  @Delete('end')
  endImpersonation(@Req() req: any) {
    return this.impersonationService.end(req.user.id);
  }
}
EOF

cat > "$SA_BACKEND/impersonation/impersonation.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImpersonationService {
  async start(superAdminId: string, tenantId: string, reason: string) {
    // TODO: create time-limited JWT scoped to tenant
    // TODO: log impersonation session to audit table
    return { sessionToken: 'TODO', expiresAt: new Date() };
  }

  async end(superAdminId: string) {
    // TODO: invalidate impersonation token, close audit log entry
    return { success: true };
  }
}
EOF

cat > "$SA_BACKEND/impersonation/impersonation.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { ImpersonationController } from './impersonation.controller';
import { ImpersonationService } from './impersonation.service';

@Module({
  controllers: [ImpersonationController],
  providers: [ImpersonationService],
})
export class ImpersonationModule {}
EOF

# Feature Flags
cat > "$SA_BACKEND/feature-flags/feature-flags.controller.ts" << 'EOF'
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('super-admin/feature-flags')
@UseGuards(SuperAdminGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get(':tenantId')
  getFlags(@Param('tenantId') tenantId: string) {
    return this.featureFlagsService.getForTenant(tenantId);
  }

  @Patch(':tenantId')
  updateFlags(@Param('tenantId') tenantId: string, @Body() flags: Record<string, boolean>) {
    return this.featureFlagsService.updateForTenant(tenantId, flags);
  }
}
EOF

cat > "$SA_BACKEND/feature-flags/feature-flags.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureFlagsService {
  async getForTenant(tenantId: string) {
    // TODO: prisma.tenantFeatureFlag.findMany({ where: { tenantId } })
    return {};
  }

  async updateForTenant(tenantId: string, flags: Record<string, boolean>) {
    // TODO: upsert each flag
    return {};
  }
}
EOF

cat > "$SA_BACKEND/feature-flags/feature-flags.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
EOF

# Plans module (minimal)
cat > "$SA_BACKEND/plans/plans.controller.ts" << 'EOF'
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { PlansService } from './plans.service';

@Controller('super-admin/plans')
@UseGuards(SuperAdminGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Patch(':tier')
  updatePricing(@Param('tier') tier: string, @Body() dto: any) {
    return this.plansService.updatePricing(tier, dto);
  }
}
EOF

cat > "$SA_BACKEND/plans/plans.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlansService {
  async findAll() {
    // TODO: prisma.plan.findMany()
    return [];
  }

  async updatePricing(tier: string, dto: any) {
    // TODO: prisma.plan.update
    return null;
  }
}
EOF

cat > "$SA_BACKEND/plans/plans.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
EOF

echo "   ✓ apps/backend-api/src/super-admin/"

# =============================================================================
# 3. FRONTEND — apps/web-frontend/src/app/(super-admin)/
# =============================================================================
echo "🎨 Creating frontend Next.js pages..."

SA_FRONTEND="$FRONTEND/src/app/(super-admin)"
mkdir -p "$SA_FRONTEND/dashboard"
mkdir -p "$SA_FRONTEND/tenants/[tenantId]"
mkdir -p "$SA_FRONTEND/billing"
mkdir -p "$SA_FRONTEND/feature-flags"
mkdir -p "$SA_FRONTEND/admins"
mkdir -p "$SA_FRONTEND/monitoring"
mkdir -p "$SA_FRONTEND/settings"

# Shared layout components
mkdir -p "$FRONTEND/src/components/super-admin/layout"
mkdir -p "$FRONTEND/src/components/super-admin/tenants"
mkdir -p "$FRONTEND/src/components/super-admin/stats"
mkdir -p "$FRONTEND/src/lib/super-admin"

# Root layout
cat > "$SA_FRONTEND/layout.tsx" << 'EOF'
import { SuperAdminSidebar } from '@/components/super-admin/layout/SuperAdminSidebar';
import { SuperAdminTopbar } from '@/components/super-admin/layout/SuperAdminTopbar';
import { ImpersonationBanner } from '@/components/super-admin/layout/ImpersonationBanner';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <SuperAdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ImpersonationBanner />
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
EOF

# Dashboard page
cat > "$SA_FRONTEND/dashboard/page.tsx" << 'EOF'
import { PlatformStatsGrid } from '@/components/super-admin/stats/PlatformStatsGrid';
import { RecentTenantsTable } from '@/components/super-admin/tenants/RecentTenantsTable';
import { MrrChart } from '@/components/super-admin/stats/MrrChart';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Chronos SaaS — Super Admin</p>
      </div>
      <PlatformStatsGrid />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <MrrChart />
        </div>
        <div>
          {/* Quick actions panel — TODO */}
        </div>
      </div>
      <RecentTenantsTable />
    </div>
  );
}
EOF

# Tenants list page
cat > "$SA_FRONTEND/tenants/page.tsx" << 'EOF'
export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenants</h1>
          <p className="text-gray-400 text-sm mt-1">All hospital accounts on the platform</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Tenant
        </button>
      </div>
      {/* TODO: TenantFilterBar */}
      {/* TODO: TenantsTable */}
    </div>
  );
}
EOF

# Tenant detail page
cat > "$SA_FRONTEND/tenants/[tenantId]/page.tsx" << 'EOF'
export default function TenantDetailPage({ params }: { params: { tenantId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tenant Detail</h1>
        <p className="text-gray-400 text-sm mt-1">ID: {params.tenantId}</p>
      </div>
      {/* TODO: TenantDetailCard */}
      {/* TODO: TenantFeatureFlagPanel */}
      {/* TODO: TenantBillingPanel */}
      {/* TODO: ImpersonateButton */}
    </div>
  );
}
EOF

# Billing page
cat > "$SA_FRONTEND/billing/page.tsx" << 'EOF'
export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Billing & Subscriptions</h1>
      {/* TODO: MRR overview */}
      {/* TODO: Plan pricing editor */}
      {/* TODO: Overdue accounts list */}
    </div>
  );
}
EOF

# Feature flags page
cat > "$SA_FRONTEND/feature-flags/page.tsx" << 'EOF'
export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
      {/* TODO: per-tenant flag toggles */}
    </div>
  );
}
EOF

# Admins page
cat > "$SA_FRONTEND/admins/page.tsx" << 'EOF'
export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Accounts</h1>
      {/* TODO: hospital admin list per tenant */}
    </div>
  );
}
EOF

# Monitoring page
cat > "$SA_FRONTEND/monitoring/page.tsx" << 'EOF'
export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
      {/* TODO: uptime, error rates, WebSocket connections */}
    </div>
  );
}
EOF

# Settings page
cat > "$SA_FRONTEND/settings/page.tsx" << 'EOF'
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
      {/* TODO: global config, maintenance mode, announcement banner */}
    </div>
  );
}
EOF

# Layout components
cat > "$FRONTEND/src/components/super-admin/layout/SuperAdminSidebar.tsx" << 'EOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Overview',      href: '/dashboard',      icon: '📊' },
  { label: 'Tenants',       href: '/tenants',         icon: '🏥' },
  { label: 'Billing',       href: '/billing',         icon: '💳' },
  { label: 'Feature Flags', href: '/feature-flags',   icon: '🚩' },
  { label: 'Admins',        href: '/admins',           icon: '👤' },
  { label: 'Monitoring',    href: '/monitoring',       icon: '📡' },
  { label: 'Settings',      href: '/settings',         icon: '⚙️'  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="text-blue-400 font-bold text-lg">⏱ Chronos</div>
        <div className="text-gray-500 text-xs mt-1">Super Admin Console</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-gray-500 text-xs">Logged in as Super Admin</div>
      </div>
    </aside>
  );
}
EOF

cat > "$FRONTEND/src/components/super-admin/layout/SuperAdminTopbar.tsx" << 'EOF'
'use client';

export function SuperAdminTopbar() {
  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="text-gray-400 text-sm">
        {/* Breadcrumb — TODO */}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white text-sm">🔔</button>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
          SA
        </div>
      </div>
    </header>
  );
}
EOF

cat > "$FRONTEND/src/components/super-admin/layout/ImpersonationBanner.tsx" << 'EOF'
'use client';
// This banner renders at layout level so it's always visible during impersonation.
// It reads from a cookie/context set when impersonation starts.

export function ImpersonationBanner() {
  // TODO: read impersonation session from cookie or context
  const isImpersonating = false;
  const tenantName = '';

  if (!isImpersonating) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-6 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        ⚠️ You are currently viewing as <strong>{tenantName}</strong> admin. 
        Actions taken here affect a real tenant.
      </span>
      <button
        className="bg-amber-700 text-white px-3 py-1 rounded text-xs hover:bg-amber-800"
        onClick={() => {/* TODO: call end impersonation API */}}
      >
        End Session
      </button>
    </div>
  );
}
EOF

# API client
cat > "$FRONTEND/src/lib/super-admin/api.ts" << 'EOF'
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function superAdminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/super-admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // TODO: attach super admin JWT
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Super admin API error: ${res.status}`);
  return res.json();
}

export const superAdminApi = {
  // Stats
  getStats: () => superAdminFetch('/stats'),
  getMrr: () => superAdminFetch('/stats/mrr'),

  // Tenants
  getTenants: (params?: { status?: string; plan?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return superAdminFetch(`/tenants${q ? `?${q}` : ''}`);
  },
  getTenant: (id: string) => superAdminFetch(`/tenants/${id}`),
  createTenant: (dto: any) => superAdminFetch('/tenants', { method: 'POST', body: JSON.stringify(dto) }),
  suspendTenant: (id: string, reason: string) =>
    superAdminFetch(`/tenants/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  reactivateTenant: (id: string) =>
    superAdminFetch(`/tenants/${id}/reactivate`, { method: 'PATCH' }),

  // Impersonation
  startImpersonation: (tenantId: string, reason: string) =>
    superAdminFetch(`/impersonate/${tenantId}`, { method: 'POST', body: JSON.stringify({ reason }) }),
  endImpersonation: () => superAdminFetch('/impersonate/end', { method: 'DELETE' }),

  // Feature flags
  getFlags: (tenantId: string) => superAdminFetch(`/feature-flags/${tenantId}`),
  updateFlags: (tenantId: string, flags: Record<string, boolean>) =>
    superAdminFetch(`/feature-flags/${tenantId}`, { method: 'PATCH', body: JSON.stringify(flags) }),
};
EOF

echo "   ✓ apps/web-frontend/src/app/(super-admin)/"
echo "   ✓ apps/web-frontend/src/components/super-admin/"
echo "   ✓ apps/web-frontend/src/lib/super-admin/"

# =============================================================================
# 4. DATABASE — Prisma schema additions hint file
# =============================================================================
echo "🗄️  Creating Prisma schema additions..."

cat > "$DATABASE/prisma/super-admin-additions.prisma.txt" << 'EOF'
// =============================================================================
// SUPER ADMIN PRISMA ADDITIONS
// Copy these models into your schema.prisma
// =============================================================================

model Tenant {
  id             String         @id @default(cuid())
  name           String
  slug           String         @unique
  status         TenantStatus   @default(TRIAL)
  plan           PlanTier       @default(STARTER)
  billingCycle   BillingCycle   @default(MONTHLY)
  adminEmail     String
  trialEndsAt    DateTime?
  suspendedAt    DateTime?
  suspendReason  String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  admins         TenantAdmin[]
  featureFlags   TenantFeatureFlag[]
  subscription   Subscription?

  @@map("tenants")
}

model TenantAdmin {
  id         String   @id @default(cuid())
  tenantId   String
  email      String   @unique
  name       String
  createdAt  DateTime @default(now())

  tenant     Tenant   @relation(fields: [tenantId], references: [id])

  @@map("tenant_admins")
}

model Subscription {
  id             String       @id @default(cuid())
  tenantId       String       @unique
  plan           PlanTier
  billingCycle   BillingCycle
  status         String       @default("ACTIVE")
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelledAt    DateTime?
  createdAt      DateTime     @default(now())

  tenant         Tenant       @relation(fields: [tenantId], references: [id])

  @@map("subscriptions")
}

model TenantFeatureFlag {
  id        String  @id @default(cuid())
  tenantId  String
  flag      String
  enabled   Boolean @default(false)

  tenant    Tenant  @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, flag])
  @@map("tenant_feature_flags")
}

model ImpersonationLog {
  id             String    @id @default(cuid())
  superAdminId   String
  tenantId       String
  tenantName     String
  reason         String
  startedAt      DateTime  @default(now())
  endedAt        DateTime?

  @@map("impersonation_logs")
}

enum TenantStatus {
  TRIAL
  ACTIVE
  SUSPENDED
  CANCELLED
}

enum PlanTier {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}
EOF

echo "   ✓ packages/database/prisma/super-admin-additions.prisma.txt"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "✅ Super Admin scaffold complete!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Register the module in your NestJS app:"
echo "   → In apps/backend-api/src/app.module.ts, add:"
echo "     import { SuperAdminModule } from './super-admin/super-admin.module';"
echo "     // and add SuperAdminModule to @Module({ imports: [...] })"
echo ""
echo "2. Add Prisma models:"
echo "   → Copy contents of packages/database/prisma/super-admin-additions.prisma.txt"
echo "     into packages/database/prisma/schema.prisma"
echo "   → Run: npm run db:migrate --workspace=packages/database"
echo ""
echo "3. Export shared types:"
echo "   → In packages/types-common/src/index.ts, add:"
echo "     export * from './super-admin';"
echo ""
echo "4. Start building components — suggested order:"
echo "   a. PlatformStatsGrid (stats cards)"
echo "   b. TenantsTable (main list)"
echo "   c. TenantDetailCard + ImpersonateButton"
echo "   d. Wire ImpersonationBanner to real session"
echo ""
echo "Done! Run from monorepo root: npm run dev"
import { BaseEntity } from './common';

/**
 * Transaction status
 */
export type TransactionStatus = 'paid' | 'overdue' | 'pending' | 'failed' | 'refunded' | 'cancelled';

/**
 * Payment method
 */
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_money' | 'cash';

/**
 * Invoice status
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';

/**
 * Billing KPI
 */
export interface BillingKpi {
  mrr: number;
  arr: number;
  payingTenants: number;
  overdueAmount: number;
  overdueAccounts: number;
  trialTenants: number;
  monthlyGrowth: number;
  churnRate: number;
  ltv: number;
}

/**
 * Revenue point
 */
export interface RevenuePoint {
  month: string;
  mrr: number;
  newRevenue: number;
  churn: number;
  netGrowth: number;
}

/**
 * Plan revenue
 */
export interface PlanRevenue {
  plan: string;
  tenants: number;
  mrr: number;
  arr: number;
  color: string;
  percentage: number;
}

/**
 * Overdue account
 */
export interface OverdueAccount {
  id: string;
  name: string;
  amount: number;
  daysOverdue: number;
  email: string;
  invoiceId: string;
  tenantId: string;
}

/**
 * Transaction
 */
export interface Transaction extends BaseEntity {
  tenantId: string;
  tenantName: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  date: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Invoice
 */
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  items: InvoiceItem[];
  notes?: string;
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Subscription
 */
export interface Subscription extends BaseEntity {
  tenantId: string;
  tenantName: string;
  plan: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  autoRenew: boolean;
  pausedAt: string | null;
  cancelledAt: string | null;
}

/**
 * Billing summary
 */
export interface BillingSummary {
  kpis: BillingKpi;
  mrrTrend: RevenuePoint[];
  planRevenue: PlanRevenue[];
  overdueAccounts: OverdueAccount[];
  recentTransactions: Transaction[];
}

/**
 * Update plan data
 */
export interface UpdatePlanData {
  monthlyPrice?: number;
  annualPrice?: number;
  features?: string[];
  limits?: Record<string, number>;
}

/**
 * Subscription action
 */
export type SubscriptionAction = 'pause' | 'resume' | 'cancel' | 'reactivate';

/**
 * Billing filters
 */
export interface BillingFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  status?: TransactionStatus | 'all';
  plan?: string;
  minAmount?: number;
  maxAmount?: number;
}

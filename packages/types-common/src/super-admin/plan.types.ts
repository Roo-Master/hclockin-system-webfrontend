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

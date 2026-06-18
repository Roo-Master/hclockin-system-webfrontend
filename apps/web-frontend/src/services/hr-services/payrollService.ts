import api from './api';

export interface PayrollRun {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'processing' | 'completed' | 'approved' | 'paid';
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  generatedAt?: string;
  processedAt?: string;
  approvedAt?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName?: string;
  period: string;
  basicSalary: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  generatedAt: string;
  status: 'draft' | 'approved' | 'paid';
}

export interface Allowance {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  taxable: boolean;
  description?: string;
}

export interface Deduction {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  mandatory: boolean;
  description?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  bracketMin?: number;
  bracketMax?: number;
  description?: string;
}

// Helper to format response for useQuery
const formatResponse = (data: any) => {
  return { data: { data: data } };
};

export const payrollService = {
  // Payroll Runs
  getPayrollRuns: async (params?: { status?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get('/payroll/runs', { params });
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll runs:', error);
      return formatResponse([]);
    }
  },

  getPayrollRun: async (id: string) => {
    try {
      const response = await api.get(`/payroll/runs/${id}`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll run:', error);
      return formatResponse(null);
    }
  },

  createPayrollRun: async (data: Partial<PayrollRun>) => {
    try {
      const response = await api.post('/payroll/runs', data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to create payroll run:', error);
      throw error;
    }
  },

  processPayrollRun: async (id: string) => {
    try {
      const response = await api.post(`/payroll/runs/${id}/process`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to process payroll run:', error);
      throw error;
    }
  },

  approvePayrollRun: async (id: string) => {
    try {
      const response = await api.post(`/payroll/runs/${id}/approve`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to approve payroll run:', error);
      throw error;
    }
  },

  deletePayrollRun: async (id: string) => {
    try {
      await api.delete(`/payroll/runs/${id}`);
      return formatResponse(null);
    } catch (error) {
      console.error('Failed to delete payroll run:', error);
      throw error;
    }
  },

  // Payslips
  getPayslips: async (params?: { employeeId?: string; period?: string; status?: string }) => {
    try {
      const response = await api.get('/payroll/payslips', { params });
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
      return formatResponse([]);
    }
  },

  getPayslip: async (id: string) => {
    try {
      const response = await api.get(`/payroll/payslips/${id}`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch payslip:', error);
      return formatResponse(null);
    }
  },

  generatePayslip: async (data: { employeeId: string; period: string }) => {
    try {
      const response = await api.post('/payroll/payslips/generate', data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to generate payslip:', error);
      throw error;
    }
  },

  // Allowances
  getAllowances: async () => {
    try {
      const response = await api.get('/payroll/allowances');
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch allowances:', error);
      return formatResponse([]);
    }
  },

  getAllowance: async (id: string) => {
    try {
      const response = await api.get(`/payroll/allowances/${id}`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      return formatResponse(null);
    }
  },

  createAllowance: async (data: Partial<Allowance>) => {
    try {
      const response = await api.post('/payroll/allowances', data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to create allowance:', error);
      throw error;
    }
  },

  updateAllowance: async (id: string, data: Partial<Allowance>) => {
    try {
      const response = await api.put(`/payroll/allowances/${id}`, data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to update allowance:', error);
      throw error;
    }
  },

  deleteAllowance: async (id: string) => {
    try {
      await api.delete(`/payroll/allowances/${id}`);
      return formatResponse(null);
    } catch (error) {
      console.error('Failed to delete allowance:', error);
      throw error;
    }
  },

  // Deductions
  getDeductions: async () => {
    try {
      const response = await api.get('/payroll/deductions');
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch deductions:', error);
      return formatResponse([]);
    }
  },

  getDeduction: async (id: string) => {
    try {
      const response = await api.get(`/payroll/deductions/${id}`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch deduction:', error);
      return formatResponse(null);
    }
  },

  createDeduction: async (data: Partial<Deduction>) => {
    try {
      const response = await api.post('/payroll/deductions', data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to create deduction:', error);
      throw error;
    }
  },

  updateDeduction: async (id: string, data: Partial<Deduction>) => {
    try {
      const response = await api.put(`/payroll/deductions/${id}`, data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to update deduction:', error);
      throw error;
    }
  },

  deleteDeduction: async (id: string) => {
    try {
      await api.delete(`/payroll/deductions/${id}`);
      return formatResponse(null);
    } catch (error) {
      console.error('Failed to delete deduction:', error);
      throw error;
    }
  },

  // Taxes
  getTaxes: async () => {
    try {
      const response = await api.get('/payroll/taxes');
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch taxes:', error);
      return formatResponse([]);
    }
  },

  getTax: async (id: string) => {
    try {
      const response = await api.get(`/payroll/taxes/${id}`);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch tax:', error);
      return formatResponse(null);
    }
  },

  createTax: async (data: Partial<Tax>) => {
    try {
      const response = await api.post('/payroll/taxes', data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to create tax:', error);
      throw error;
    }
  },

  updateTax: async (id: string, data: Partial<Tax>) => {
    try {
      const response = await api.put(`/payroll/taxes/${id}`, data);
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to update tax:', error);
      throw error;
    }
  },

  deleteTax: async (id: string) => {
    try {
      await api.delete(`/payroll/taxes/${id}`);
      return formatResponse(null);
    } catch (error) {
      console.error('Failed to delete tax:', error);
      throw error;
    }
  },

  // Payroll Reports
  getPayrollReports: async (params?: { startDate?: string; endDate?: string; departmentId?: string }) => {
    try {
      const response = await api.get('/payroll/reports', { params });
      return formatResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll reports:', error);
      return formatResponse([]);
    }
  }
};

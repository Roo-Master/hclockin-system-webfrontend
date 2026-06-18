import api from './api';

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName?: string;
  jobTitle: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  avatar?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  jobTitle: string;
  hireDate: string;
  salary?: number;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: 'permanent' | 'contract' | 'part_time' | 'intern';
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const employeeService = {
  // Employee CRUD
  getEmployees: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    status?: string;
  }) => {
    try {
      const response = await api.get<PaginatedResponse<Employee>>('/employees', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Return empty data structure when API is not ready
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },

  getEmployee: async (id: string) => {
    try {
      const response = await api.get<Employee>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employee:', error);
      return null;
    }
  },

  createEmployee: async (data: EmployeeFormData) => {
    try {
      const response = await api.post<Employee>('/employees', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  },

  updateEmployee: async (id: string, data: Partial<EmployeeFormData>) => {
    try {
      const response = await api.put<Employee>(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  },

  deleteEmployee: async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  },

  // Department methods
  getDepartments: async () => {
    try {
      const response = await api.get<Department[]>('/departments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  },

  getDepartmentStats: async () => {
    try {
      const response = await api.get('/departments/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch department stats:', error);
      return [];
    }
  },

  createDepartment: async (data: Partial<Department>) => {
    try {
      const response = await api.post<Department>('/departments', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  },

  updateDepartment: async (id: string, data: Partial<Department>) => {
    try {
      const response = await api.put<Department>(`/departments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update department:', error);
      throw error;
    }
  },

  deleteDepartment: async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
    } catch (error) {
      console.error('Failed to delete department:', error);
      throw error;
    }
  },

  // Contract methods
  getContracts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    employeeId?: string;
    status?: string;
  }) => {
    try {
      const response = await api.get<PaginatedResponse<Contract>>('/contracts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },

  getContract: async (id: string) => {
    try {
      const response = await api.get<Contract>(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      return null;
    }
  },

  createContract: async (data: Partial<Contract>) => {
    try {
      const response = await api.post<Contract>('/contracts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create contract:', error);
      throw error;
    }
  },

  updateContract: async (id: string, data: Partial<Contract>) => {
    try {
      const response = await api.put<Contract>(`/contracts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update contract:', error);
      throw error;
    }
  },

  deleteContract: async (id: string) => {
    try {
      await api.delete(`/contracts/${id}`);
    } catch (error) {
      console.error('Failed to delete contract:', error);
      throw error;
    }
  }
};

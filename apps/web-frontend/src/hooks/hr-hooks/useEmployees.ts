import { useApi } from './useApi';
import { employeeService, Employee, PaginatedResponse } from '../../services/hr-services/employeeService';

interface UseEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

export function useEmployees(params: UseEmployeesParams = {}) {
  return useApi<PaginatedResponse<Employee>>(
    () => employeeService.getEmployees(params),
    {
      dependencies: [params.page, params.limit, params.search, params.departmentId, params.status],
    }
  );
}

export function useEmployee(id: string) {
  return useApi<Employee>(
    () => employeeService.getEmployee(id),
    {
      dependencies: [id],
      enabled: !!id,
    }
  );
}

import { useApi } from './useApi';
import { dashboardService, DashboardStats } from '../../services/hr-services/dashboardService';

export function useDashboardStats() {
  return useApi<DashboardStats>(
    () => dashboardService.getStats(),
    {
      onError: (error) => {
        console.error('Failed to fetch dashboard stats:', error);
      },
    }
  );
}

export function useRecentActivity(limit: number = 10) {
  return useApi(
    () => dashboardService.getRecentActivity(limit),
    {
      dependencies: [limit],
    }
  );
}

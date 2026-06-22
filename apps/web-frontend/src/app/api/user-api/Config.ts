export const USER_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
  TIMEOUT: 15000,
} as const;

export const USER_ENDPOINTS = {
  MY_SUMMARIES: '/attendance/my-summaries',
  MY_LOGS: '/attendance/my-logs',
  MY_LEAVES: '/leave/employee/me',
  MY_LEAVE_BALANCES: '/leave/balances/me',
  LEAVE_REQUESTS_POST: '/leave/requests',
  MY_NOTIFICATIONS: '/api/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: '/api/notifications/mark-all-read',
  MY_PROFILE: '/auth/me',
  UPDATE_PROFILE: '/auth/update-profile',
  MY_CORRECTIONS: '/attendance/corrections',
  SUBMIT_CORRECTION: '/attendance/corrections',
  MY_SHIFTS: '/shifts/assignments',
} as const;

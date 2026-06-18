const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Generic request helper ───────────────────────────────────────────────────
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // sends JWT cookie automatically
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Session expired — redirect to login
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export async function getMyAttendance() {
  return request('/attendance/my');
}

export async function getMyClockLogs() {
  return request('/attendance/my/logs');
}

export async function submitCorrectionRequest(data: {
  date: string;
  issueType: string;
  notes: string;
}) {
  return request('/attendance/correction', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Shifts / Roster ──────────────────────────────────────────────────────────
export async function getMyShifts() {
  return request('/roster/my');
}

// ─── Leave ───────────────────────────────────────────────────────────────────
export async function getMyLeaveRequests() {
  return request('/leave/my');
}

export async function getMyLeaveBalances() {
  return request('/leave/balances');
}

export async function submitLeaveRequest(data: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  return request('/leave', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelLeaveRequest(leaveId: string) {
  return request(`/leave/${leaveId}/cancel`, {
    method: 'PATCH',
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getMyNotifications() {
  return request('/notifications/my');
}

export async function markNotificationRead(notificationId: string) {
  return request(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getMyProfile() {
  return request('/employee/me');
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}) {
  return request('/employee/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
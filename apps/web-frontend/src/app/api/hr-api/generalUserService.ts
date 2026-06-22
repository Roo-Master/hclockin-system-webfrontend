import axiosInstance from './axiosinstance';
import { ENDPOINTS } from './Config';

// ─── ATTENDANCE ─────────────────────────────────────────────────

export const getMyAttendanceSummaries = (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => axiosInstance.get(ENDPOINTS.MY_SUMMARIES, { params }).then(r => r.data);

export const getMyClockLogs = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get(ENDPOINTS.MY_LOGS, { params }).then(r => r.data);

// ─── LEAVE ──────────────────────────────────────────────────────

export const getMyLeaveHistory = () =>
  axiosInstance.get(ENDPOINTS.MY_LEAVES).then(r => r.data);

export const getMyLeaveBalances = () =>
  axiosInstance.get(ENDPOINTS.MY_LEAVE_BALANCES).then(r => r.data);

export const applyForLeave = (payload: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) => axiosInstance.post(ENDPOINTS.LEAVE_REQUESTS_POST, payload).then(r => r.data);

// ─── CORRECTIONS ─────────────────────────────────────────────────

export const getMyCorrections = () =>
  axiosInstance.get(ENDPOINTS.MY_CORRECTIONS).then(r => r.data);

export const submitCorrectionRequest = (payload: {
  date: string;
  issueType: string;
  notes?: string;
}) => axiosInstance.post(ENDPOINTS.SUBMIT_CORRECTION, payload).then(r => r.data);

// ─── NOTIFICATIONS ───────────────────────────────────────────────

export const getMyNotifications = () =>
  axiosInstance.get(ENDPOINTS.MY_NOTIFICATIONS).then(r => r.data);

export const markNotificationRead = (id: string) =>
  axiosInstance.patch(ENDPOINTS.MARK_NOTIFICATION_READ(id)).then(r => r.data);

export const markAllNotificationsRead = () =>
  axiosInstance.post(ENDPOINTS.MARK_ALL_READ).then(r => r.data);

// ─── PROFILE ─────────────────────────────────────────────────────

export const getMyProfile = () =>
  axiosInstance.get(ENDPOINTS.MY_PROFILE).then(r => r.data);

export const updateMyProfile = (payload: {
  name?: string;
  phone?: string;
  emergencyContact?: string;
}) => axiosInstance.post(ENDPOINTS.UPDATE_PROFILE, payload).then(r => r.data);

// ─── SHIFTS ──────────────────────────────────────────────────────

export const getMyShifts = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get(ENDPOINTS.MY_SHIFTS, { params }).then(r => r.data);
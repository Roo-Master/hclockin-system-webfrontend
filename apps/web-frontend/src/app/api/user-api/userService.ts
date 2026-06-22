import axiosInstance from './axiosinstance';
import { USER_ENDPOINTS } from './Config';

export const getMyAttendanceSummaries = (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => axiosInstance.get(USER_ENDPOINTS.MY_SUMMARIES, { params }).then((r: { data: unknown }) => r.data);

export const getMyClockLogs = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get(USER_ENDPOINTS.MY_LOGS, { params }).then((r: { data: unknown }) => r.data);

export const getMyLeaveHistory = () =>
  axiosInstance.get(USER_ENDPOINTS.MY_LEAVES).then((r: { data: unknown }) => r.data);

export const getMyLeaveBalances = () =>
  axiosInstance.get(USER_ENDPOINTS.MY_LEAVE_BALANCES).then((r: { data: unknown }) => r.data);

export const applyForLeave = (payload: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) => axiosInstance.post(USER_ENDPOINTS.LEAVE_REQUESTS_POST, payload).then((r: { data: unknown }) => r.data);

export const getMyCorrections = () =>
  axiosInstance.get(USER_ENDPOINTS.MY_CORRECTIONS).then((r: { data: unknown }) => r.data);

export const submitCorrectionRequest = (payload: {
  date: string;
  issueType: string;
  notes?: string;
}) => axiosInstance.post(USER_ENDPOINTS.SUBMIT_CORRECTION, payload).then((r: { data: unknown }) => r.data);

export const getMyNotifications = () =>
  axiosInstance.get(USER_ENDPOINTS.MY_NOTIFICATIONS).then((r: { data: unknown }) => r.data);

export const markNotificationRead = (id: string) =>
  axiosInstance.patch(USER_ENDPOINTS.MARK_NOTIFICATION_READ(id)).then((r: { data: unknown }) => r.data);

export const markAllNotificationsRead = () =>
  axiosInstance.post(USER_ENDPOINTS.MARK_ALL_READ).then((r: { data: unknown }) => r.data);

export const getMyProfile = () =>
  axiosInstance.get(USER_ENDPOINTS.MY_PROFILE).then((r: { data: unknown }) => r.data);

export const updateMyProfile = (payload: {
  name?: string;
  phone?: string;
  emergencyContact?: string;
}) => axiosInstance.post(USER_ENDPOINTS.UPDATE_PROFILE, payload).then((r: { data: unknown }) => r.data);

export const getMyShifts = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get(USER_ENDPOINTS.MY_SHIFTS, { params }).then((r: { data: unknown }) => r.data);

import { useCallback } from 'react';
import { useApi } from './useApi';
import * as svc from '../../app/api/hr-api/generalUserService';

export const useMyAttendance = (params?: { startDate?: string; endDate?: string }) => {
  const fn = useCallback(() => svc.getMyAttendanceSummaries(params), [params?.startDate, params?.endDate]);
  return useApi(fn);
};

export const useMyClockLogs = () => {
  const fn = useCallback(() => svc.getMyClockLogs(), []);
  return useApi(fn);
};

export const useMyLeaveHistory = () => {
  const fn = useCallback(() => svc.getMyLeaveHistory(), []);
  return useApi(fn);
};

export const useMyLeaveBalances = () => {
  const fn = useCallback(() => svc.getMyLeaveBalances(), []);
  return useApi(fn);
};

export const useMyNotifications = () => {
  const fn = useCallback(() => svc.getMyNotifications(), []);
  return useApi(fn);
};

export const useMyProfile = () => {
  const fn = useCallback(() => svc.getMyProfile(), []);
  return useApi(fn);
};

export const useMyShifts = () => {
  const fn = useCallback(() => svc.getMyShifts(), []);
  return useApi(fn);
};

export const useMyCorrections = () => {
  const fn = useCallback(() => svc.getMyCorrections(), []);
  return useApi(fn);
};

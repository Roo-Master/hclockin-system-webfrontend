import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AttendanceService } from '../attendance.service';

@Injectable()
export class AttendanceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private attendanceService: AttendanceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const attendanceId = request.params.id || request.body.attendanceId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin can access all
    if (user.role === 'admin' || user.role === 'manager') {
      return true;
    }

    // Check if user is accessing their own attendance
    if (attendanceId) {
      const attendance = await Promise.resolve(null);
      if (attendance.userId !== user.id) {
        throw new ForbiddenException('You can only access your own attendance records');
      }
    }

    // Check working hours access
    const currentHour = new Date().getHours();
    const isWorkingHour = currentHour >= 9 && currentHour <= 18;
    
    if (!isWorkingHour && request.method !== 'GET') {
      throw new ForbiddenException('Attendance modifications only allowed during working hours');
    }

    return true;
  }
}
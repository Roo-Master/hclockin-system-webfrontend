import DashboardLayout from '@/components/layout/DashboardLayout';
import AlertBanner from '@/components/dashboard/AlertBanner';
import KPIRow from '@/components/dashboard/KPIRow';
import AttendanceCard from '@/components/dashboard/AttendanceCard';
import UpcomingShifts from '@/components/dashboard/UpcomingShifts';
import LeaveRequests from '@/components/dashboard/LeaveRequests';
import LeaveBalances from '@/components/dashboard/LeaveBalances';
import CorrectionRequest from '@/components/dashboard/CorrectionRequest';
import AttendanceCalendar from '@/components/dashboard/AttendanceCalendar';
import HoursWorked from '@/components/dashboard/HoursWorked';
import NotificationsPreview from '@/components/dashboard/NotificationsPreview';
import ProfileCard from '@/components/dashboard/ProfileCard';

export default function HomePage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-5">
        <AlertBanner message="You have a missing clock-out on 11 June. Submit a correction request to avoid a payroll discrepancy." />
        <KPIRow />
        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="flex flex-col gap-5">
            <AttendanceCard />
            <UpcomingShifts />
            <div className="grid grid-cols-2 gap-5">
              <LeaveRequests />
              <LeaveBalances />
            </div>
            <CorrectionRequest />
          </div>
          <div className="flex flex-col gap-5">
            <AttendanceCalendar />
            <HoursWorked />
            <NotificationsPreview />
            <ProfileCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

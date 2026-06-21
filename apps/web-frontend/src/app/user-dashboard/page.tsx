import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import AlertBanner from '@/components/employee-components/dashboard/AlertBanner';
import KPIRow from '@/components/employee-components/dashboard/KPIRow';
import AttendanceCard from '@/components/employee-components/dashboard/AttendanceCard';
import LeaveBalances from '@/components/employee-components/dashboard/LeaveBalances';
import LeaveRequests from '@/components/employee-components/dashboard/LeaveRequests';
import UpcomingShifts from '@/components/employee-components/dashboard/UpcomingShifts';
import NotificationsPreview from '@/components/employee-components/dashboard/NotificationsPreview';
import CorrectionRequest from '@/components/employee-components/dashboard/CorrectionRequest';
import ProfileCard from '@/components/employee-components/dashboard/ProfileCard';
import HoursWorked from '@/components/employee-components/dashboard/HoursWorked';

export default function UserDashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-5">
        <AlertBanner message="You have a missing clock-out. Please submit a correction request if needed." />

        <KPIRow />

        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="flex flex-col gap-5">
            <AttendanceCard />
            <LeaveRequests />
            <UpcomingShifts />
          </div>
          <div className="flex flex-col gap-5">
            <ProfileCard />
            <LeaveBalances />
            <HoursWorked />
            <NotificationsPreview />
            <CorrectionRequest />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

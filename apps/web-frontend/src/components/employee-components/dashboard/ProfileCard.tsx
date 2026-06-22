const profile = [
    { label: 'Employee ID', value: 'KNH-2241' },
    { label: 'Department', value: 'ICU' },
    { label: 'Position', value: 'Staff Nurse' },
    { label: 'Joined', value: 'Mar 2022' },
    { label: 'Email', value: 'm.kamau@knh.go.ke' },
  ];
  
  export default function ProfileCard() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">My profile</h2>
          <a href="/user-dashboard/profile" className="text-label text-success hover:underline">
            Edit →
          </a>
        </div>
  
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center text-success text-sm font-semibold flex-shrink-0">
            MK
          </div>
          <div>
            <p className="text-body font-semibold text-primary">Mary Kamau</p>
            <p className="text-label text-secondary">Staff Nurse · Kenyatta National Hospital</p>
          </div>
        </div>
  
        {/* Details */}
        <div className="flex flex-col">
          {profile.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
            >
              <span className="text-label text-secondary">{item.label}</span>
              <span className="text-label font-medium text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
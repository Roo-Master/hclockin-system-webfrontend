const notifications = [
    {
      icon: '⚠',
      iconStyle: 'bg-warning-bg text-warning',
      text: 'Missing clock-out detected for Thu 11 Jun. Please submit a correction.',
      time: 'Today · 08:00',
      unread: true,
    },
    {
      icon: '▦',
      iconStyle: 'bg-info-bg text-info',
      text: 'Shift assigned: Night shift ICU on Thu 18 Jun. Pending roster confirmation.',
      time: 'Yesterday · 14:32',
      unread: true,
    },
    {
      icon: '◷',
      iconStyle: 'bg-warning-bg text-warning',
      text: 'Your annual leave request for Jul 3–7 is pending HR approval.',
      time: 'Fri 12 Jun · 10:15',
      unread: true,
    },
    {
      icon: '✓',
      iconStyle: 'bg-success-bg text-success',
      text: 'Sick leave for May 22–23 has been approved by HR.',
      time: 'Fri 22 May · 09:44',
      unread: false,
    },
  ];
  
  export default function NotificationsPreview() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Notifications</h2>
          <a href="/dashboard/notifications" className="text-label text-success hover:underline">
            See all →
          </a>
        </div>
  
        {/* List */}
        <div className="flex flex-col">
          {notifications.map((notif, index) => (
            <div
              key={index}
              className="flex items-start gap-3 py-3 border-b border-border last:border-0"
            >
              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5 ${notif.iconStyle}`}
              >
                {notif.icon}
              </div>
  
              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-body leading-snug ${
                    notif.unread ? 'font-medium text-primary' : 'text-secondary'
                  }`}
                >
                  {notif.text}
                </p>
                <p className="text-label text-tertiary mt-1">{notif.time}</p>
              </div>
  
              {/* Unread dot */}
              {notif.unread && (
                <div className="w-2 h-2 rounded-full bg-info flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
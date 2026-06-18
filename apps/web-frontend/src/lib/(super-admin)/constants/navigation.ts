export interface NavItem {
  title: string;
  href: string;
  icon: string;
  section: string;
  children?: NavItem[];
  badge?: number;
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    section: 'Main',
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: '🏥',
    section: 'Management',
  },
  {
    title: 'Admins',
    href: '/admin',
    icon: '👤',
    section: 'Management',
  },
  {
    title: 'Feature Flags',
    href: '/feature-flags',
    icon: '🚩',
    section: 'Management',
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: '💰',
    section: 'Finance',
  },
  {
    title: 'System Monitor',
    href: '/system-monitor',
    icon: '📈',
    section: 'System',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: '⚙️',
    section: 'System',
  },
];

export const sections = {
  main: 'Main',
  management: 'Management',
  finance: 'Finance',
  system: 'System',
} as const;

export type Section = typeof sections[keyof typeof sections];

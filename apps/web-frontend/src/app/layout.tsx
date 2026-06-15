import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Hospital Chronos',
  description: 'Hospital workforce management and attendance platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

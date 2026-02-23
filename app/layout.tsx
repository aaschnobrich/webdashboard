import type { Metadata } from 'next';
import './globals.css';
import { startDevCron } from '@/lib/dev-cron';

startDevCron();

export const metadata: Metadata = {
  title: 'Uptime Globe',
  description: 'Simple uptime monitoring for your websites.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

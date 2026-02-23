import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Uptime Globe',
  description: 'A simple front-page MVP for Uptime Globe.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

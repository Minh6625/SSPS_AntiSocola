import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Layered Architecture - User Management',
  description: 'Full-stack application with Next.js & Java Spring Boot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

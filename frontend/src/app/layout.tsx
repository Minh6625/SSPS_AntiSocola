import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPSS SIU - Smart Printing Service System',
  description: 'Hệ thống in ấn thông minh - Đại học Quốc tế TP.HCM',
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

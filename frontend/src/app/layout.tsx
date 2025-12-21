import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPSS - SIU ',
  description: 'Hệ thống in ấn thông minh - Đại học Quốc tế TP.HCM',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}

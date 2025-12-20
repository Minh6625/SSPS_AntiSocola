import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPSS - SIU ',
  description: 'Hệ thống in ấn thông minh - Đại học Quốc tế TP.HCM',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

import './globals.css';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

const vazir = localFont({
  src: [
    {
      path: '../public/fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazir',
});

export const metadata = {
  title: 'Hobab Sekeh',
  description: 'Gold and Coin Conversion Calculator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable}`}>
      <head>
        <title>تبدیل سکه و طلا</title>
      </head>
      <body className={`${inter.className} font-vazir`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

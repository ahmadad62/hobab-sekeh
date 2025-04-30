import './globals.css';
import localFont from 'next/font/local';

const vazir = localFont({
  src: [
    {
      path: '../../public/fonts/vazir/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazir/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/vazir/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazir',
});

export const metadata = {
  title: 'حباب سکه',
  description: 'محاسبه حباب سکه و تبدیل به طلا',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`h-full ${vazir.variable}`}>
      <body className="h-full bg-gray-50 dark:bg-gray-900 font-vazir">
        {children}
      </body>
    </html>
  );
}

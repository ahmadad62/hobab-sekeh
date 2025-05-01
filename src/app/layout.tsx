import './globals.css';
import './fonts.css';
import Providers from '@/components/Providers';

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
    <html lang="fa" dir="rtl" className="antialiased">
      <head>
        <title>تبدیل سکه و طلا</title>
      </head>
      <body>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}

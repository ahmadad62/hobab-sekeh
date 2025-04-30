'use client';

import './globals.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Create theme with RTL direction
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: 'rgb(234 179 8)',
    },
  },
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
    <html lang="fa" dir="rtl">
      <head>
        <title>تبدیل سکه و طلا</title>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider options={{ key: 'css', prepend: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

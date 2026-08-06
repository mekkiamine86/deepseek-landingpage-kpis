import localFont from 'next/font/local';

export const gretaArabic = localFont({
  src: [
    { path: './fonts/GretaArabic-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/GretaArabic-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/GretaArabic-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-cairo',
});

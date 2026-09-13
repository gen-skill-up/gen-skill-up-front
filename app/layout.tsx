import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import DashboardLayoutWrapper from './components/DashboardLayoutWrapper';

export const metadata: Metadata = {
  title: 'LearnWithAI — التعلم الذكي للأطفال',
  description: 'منصة تعليمية تفاعلية بالذكاء الاصطناعي للأطفال من 6 إلى 14 سنة',
  keywords: ['تعلم', 'أطفال', 'ذكاء اصطناعي', 'تعليم', 'مدرسة'],
  openGraph: {
    title: 'LearnWithAI',
    description: 'تعلّم بطريقة ذكية وممتعة!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <DashboardLayoutWrapper>
            {children}
          </DashboardLayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}


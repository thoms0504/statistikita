import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from '@/components/ConfirmDialog';

export const metadata: Metadata = {
  title: 'StatistiKita – BPS Provinsi Lampung',
  description: 'Pelayanan Statistik Terpadu BPS Provinsi Lampung',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ConfirmProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

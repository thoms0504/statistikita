'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { BarChart2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { toast.error('Kode OAuth tidak ditemukan'); router.push('/login'); return; }

    authAPI.googleCallback(code)
      .then(res => {
        login(res.data.access_token, res.data.user);
        toast.success('Berhasil masuk dengan Google!');
        router.push('/forum');
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Gagal masuk dengan Google');
        router.push('/login');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bps-blue to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <BarChart2 className="w-10 h-10 text-bps-blue mx-auto mb-4 animate-pulse" />
        <p className="text-gray-700 font-medium">Memproses login Google...</p>
        <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
      </div>
    </div>
  );
}

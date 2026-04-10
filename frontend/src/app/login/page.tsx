'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart2, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Isi semua field'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.access_token, res.data.user);
      toast.success('Berhasil masuk!');
      router.push(res.data.user.role === 'admin' ? '/admin' : '/forum');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal masuk');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const encodedRedirect = encodeURIComponent(redirectUri);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodedRedirect}&scope=openid%20email%20profile`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bps-blue to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-bps-blue rounded-lg p-1.5"><BarChart2 className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold text-gray-900">StatistiKita</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang kembali!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input className="input-field" type="text" placeholder="username Anda"
              value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-gray-200 flex-1" /><span className="text-xs text-gray-400">atau</span><div className="h-px bg-gray-200 flex-1" />
        </div>

        <button onClick={handleGoogle} className="btn-secondary w-full flex items-center justify-center gap-3 py-2.5">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Masuk dengan Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}

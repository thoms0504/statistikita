'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart2, Eye, EyeOff, ImagePlus, X } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nama_lengkap: '', username: '', email: '', password: '', jenis_kelamin: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const clearPhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.username || !form.password) { toast.error('Isi semua field wajib'); return; }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama_lengkap', form.nama_lengkap);
      formData.append('username', form.username);
      formData.append('password', form.password);
      if (form.email) formData.append('email', form.email);
      if (form.jenis_kelamin) formData.append('jenis_kelamin', form.jenis_kelamin);
      if (photo) formData.append('photo', photo);
      const res = await authAPI.register(formData);
      login(res.data.access_token, res.data.user);
      toast.success('Registrasi berhasil!');
      router.push('/forum');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bps-blue to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-bps-blue rounded-lg p-1.5"><BarChart2 className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold text-gray-900">StatistiKita</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar dan mulai gunakan StatistiKita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className="input-field" type="text" placeholder="Nama lengkap Anda" value={form.nama_lengkap} onChange={set('nama_lengkap')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
              <input className="input-field" type="text" placeholder="username" value={form.username} onChange={set('username')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin</label>
              <select className="input-field" value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input className="input-field" type="email" placeholder="email@contoh.com" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Profil (Opsional)</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={photoInputRef}
                  id="register-photo"
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="register-photo"
                  className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white/80 px-4 py-3 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <ImagePlus className="w-5 h-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-700">Pilih foto profil</span>
                    <span className="block text-xs text-slate-500">PNG, JPG, atau WEBP</span>
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    Pilih
                  </span>
                </label>
              </div>
              {photoPreview && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/70">
                  <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{photo?.name || 'Foto profil'}</p>
                    <p className="text-xs text-slate-500">
                      {photo ? `${(photo.size / 1024 / 1024).toFixed(2)} MB` : 'Preview foto profil'}
                    </p>
                  </div>
                  {photo && (
                    <button type="button" onClick={clearPhoto} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

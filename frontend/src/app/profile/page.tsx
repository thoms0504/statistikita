'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, UploadCloud, X } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const [form, setForm] = useState({ nama_lengkap: '', username: '', email: '', jenis_kelamin: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [storedPreview, setStoredPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      nama_lengkap: user.nama_lengkap || '',
      username: user.username || '',
      email: user.email || '',
      jenis_kelamin: user.jenis_kelamin || '',
    });
    if (user.avatar_url) {
      const resolved = user.avatar_url.startsWith('http') ? user.avatar_url : `${baseUrl}${user.avatar_url}`;
      setStoredPreview(resolved);
      setPhotoPreview(resolved);
    } else {
      setStoredPreview(null);
      setPhotoPreview(null);
    }
  }, [user, baseUrl]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const clearPhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(storedPreview);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.username) {
      toast.error('Nama lengkap dan username wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nama_lengkap', form.nama_lengkap);
      formData.append('username', form.username);
      if (form.email) formData.append('email', form.email);
      if (form.jenis_kelamin) formData.append('jenis_kelamin', form.jenis_kelamin);
      if (photo) formData.append('photo', photo);

      await authAPI.updateProfile(formData);
      await refreshUser();
      setPhoto(null);
      toast.success('Profil berhasil diperbarui');
      const from = searchParams?.get('from');
      if (from && from.startsWith('/')) {
        router.push(from);
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Perbarui data diri Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className="input-field" type="text" value={form.nama_lengkap} onChange={set('nama_lengkap')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
              <input className="input-field" type="text" value={form.username} onChange={set('username')} />
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
            <input className="input-field" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Profil</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  id="profile-photo"
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="profile-photo"
                  className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white/80 px-4 py-3 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <UploadCloud className="w-5 h-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-700">Unggah foto profil</span>
                    <span className="block text-xs text-slate-500">PNG/JPG/WEBP, maksimal 5MB</span>
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    Pilih Foto
                  </span>
                </label>
              </div>
              {photoPreview && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/70">
                  <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {photo ? photo.name : 'Foto saat ini'}
                    </p>
                    {photo ? (
                      <p className="text-xs text-slate-500">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
                    ) : (
                      <p className="text-xs text-slate-500">Preview foto profil</p>
                    )}
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
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 mt-2">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}

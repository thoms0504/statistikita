'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, UploadCloud, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { forumAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Tag } from '@/types';
import toast from 'react-hot-toast';

export default function AskPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ judul: '', deskripsi: '' });
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    forumAPI.getTags().then(r => setTags(r.data.tags)).catch(() => {});
  }, []);

  const addTag = (name: string) => {
    const t = name.trim().toLowerCase();
    if (!t || selectedTags.includes(t) || selectedTags.length >= 5) return;
    setSelectedTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setSelectedTags(prev => prev.filter(x => x !== t));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.deskripsi.trim()) { toast.error('Judul dan deskripsi wajib diisi'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('judul', form.judul);
      fd.append('deskripsi', form.deskripsi);
      selectedTags.forEach(t => fd.append('tags', t));
      if (file) fd.append('file', file);
      const res = await forumAPI.createPost(fd);
      toast.success('Pertanyaan berhasil dibuat!');
      router.push(`/forum/${res.data.post.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal membuat pertanyaan');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/forum" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-5">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Forum
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Buat Pertanyaan Baru</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Judul Pertanyaan <span className="text-red-500">*</span>
              </label>
              <input className="input-field" type="text"
                placeholder="Tuliskan pertanyaan secara singkat dan jelas..."
                value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
                maxLength={255}
              />
              <p className="text-xs text-gray-400 mt-1">{form.judul.length}/255 karakter</p>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea className="input-field min-h-[160px] text-sm"
                placeholder="Jelaskan pertanyaan Anda secara detail. Sertakan konteks, apa yang sudah dicoba, dan informasi relevan lainnya."
                value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tag <span className="text-xs text-gray-400">(maks. 5 tag)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map(t => (
                  <span key={t} className="badge bg-blue-100 text-blue-700 flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input-field flex-1 text-sm" type="text"
                  placeholder="Ketik tag dan tekan Enter atau pilih di bawah"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                />
                <button type="button" onClick={() => addTag(tagInput)} className="btn-secondary px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.filter(t => !selectedTags.includes(t.name)).slice(0, 12).map(t => (
                    <button key={t.id} type="button" onClick={() => addTag(t.name)}
                      className="badge bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lampiran <span className="text-xs text-gray-400">(opsional)</span>
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    id="forum-attachment"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="forum-attachment"
                    className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white/80 px-4 py-3 cursor-pointer transition hover:border-blue-400 hover:bg-blue-50/40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                      <UploadCloud className="w-5 h-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-700">Tambahkan lampiran</span>
                      <span className="block text-xs text-slate-500">PDF, gambar, atau dokumen (maks. 16MB)</span>
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      Pilih File
                    </span>
                  </label>
                </div>
                {file && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/70">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={clearFile} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5">
                {submitting ? 'Memposting...' : 'Posting Pertanyaan'}
              </button>
              <Link href="/forum" className="btn-secondary px-6 py-2.5 text-center">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

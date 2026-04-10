'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Pencil, Trash2, UserCheck, UserX, X, Search } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ nama_lengkap: '', username: '', email: '', role: 'user' as 'user' | 'admin' });
  const [saving, setSaving] = useState(false);

  const [resetInfo, setResetInfo] = useState<{ user: User; password: string } | null>(null);
  const confirm = useConfirm();

  useEffect(() => { fetchUsers(1); }, []);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page: p, search });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.pages || 1);
      setPage(p);
    } catch {
      toast.error('Gagal memuat daftar pengguna');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      nama_lengkap: user.nama_lengkap || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editForm.nama_lengkap.trim() || !editForm.username.trim()) {
      toast.error('Nama lengkap dan username wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const res = await adminAPI.updateUser(editingUser.id, {
        nama_lengkap: editForm.nama_lengkap.trim(),
        username: editForm.username.trim(),
        email: editForm.email.trim() || undefined,
        role: editForm.role,
      });
      setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data.user : u));
      setEditingUser(null);
      toast.success('Pengguna diperbarui');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await adminAPI.toggleUserStatus(user.id, !user.is_active);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u));
      toast.success('Status akun diperbarui');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengubah status akun');
    }
  };

  const handleResetPassword = async (user: User) => {
    const ok = await confirm({
      title: 'Reset password',
      message: `Reset password untuk ${user.username}? Password sementara akan dibuat otomatis.`,
      confirmText: 'Reset',
    });
    if (!ok) return;
    try {
      const res = await adminAPI.resetUserPassword(user.id);
      setResetInfo({ user, password: res.data.temporary_password });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal reset password');
    }
  };

  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: 'Hapus akun',
      message: `Hapus akun ${user.username}? Tindakan ini permanen dan tidak bisa dibatalkan.`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('Pengguna dihapus');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus pengguna');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Monitoring Pengguna</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} total pengguna</p>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9 text-sm"
              type="text"
              placeholder="Cari username/nama/email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers(1)}
            />
          </div>
          <button className="btn-primary text-sm px-4" onClick={() => fetchUsers(1)}>Filter</button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-14 rounded" />)}</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Lengkap</th>
                  <th className="px-4 py-3 w-40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'opacity-70' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">@{user.username}</div>
                      <div className="text-xs text-gray-400">{user.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{user.nama_lengkap}</div>
                      <div className="text-xs text-gray-400">
                        <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <span className="ml-2 badge bg-gray-100 text-gray-600 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button disabled={page === 1} onClick={() => fetchUsers(page - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">{'<' } Prev</button>
          <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => fetchUsers(page + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next {'>'}</button>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Edit pengguna</p>
                <h2 className="font-semibold text-gray-900">{editingUser.username}</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                  className="input-field"
                  type="text"
                  value={editForm.nama_lengkap}
                  onChange={e => setEditForm(p => ({ ...p, nama_lengkap: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    className="input-field"
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select
                    className="input-field"
                    value={editForm.role}
                    onChange={e => setEditForm(p => ({ ...p, role: e.target.value as 'user' | 'admin' }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setEditingUser(null)}>Batal</button>
              <button className="btn-primary flex-1" disabled={saving} onClick={handleSaveEdit}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Password baru untuk</p>
                <h2 className="font-semibold text-gray-900">{resetInfo.user.username}</h2>
              </div>
              <button onClick={() => setResetInfo(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Sampaikan password sementara berikut ke pengguna:</p>
              <div className="mt-3 px-4 py-3 rounded-xl bg-slate-900 text-white font-mono text-sm tracking-wide">
                {resetInfo.password}
              </div>
            </div>
            <div className="px-4 pb-4">
              <button className="btn-primary w-full" onClick={() => setResetInfo(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

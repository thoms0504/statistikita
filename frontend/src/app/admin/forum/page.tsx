'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Hash, List } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { AdminBarChart, AdminPieChart, AdminWordCloud } from '@/components/AdminChart';

interface Stats {
  total_posts: number;
  total_answers: number;
  posts_per_day: { date: string; count: number }[];
  tag_distribution: { name: string; count: number }[];
  top_words: { text: string; value: number }[];
}

export default function AdminForumDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getForumStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-hero admin-hero-forum relative overflow-hidden rounded-2xl text-white p-6 mb-6">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Forum</h1>
            <p className="text-white/80 text-sm mt-1">Analitik diskusi, tag, dan tren jawaban</p>
          </div>
          <Link href="/admin/forum/questions" className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <List className="w-4 h-4" /> Kelola Postingan
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="card shimmer h-24" />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<MessageSquare className="w-5 h-5 text-blue-600" />} label="Total Post" value={stats?.total_posts || 0} bg="bg-blue-50" />
            <StatCard icon={<Users className="w-5 h-5 text-green-600" />} label="Total Jawaban" value={stats?.total_answers || 0} bg="bg-green-50" />
            <StatCard icon={<Hash className="w-5 h-5 text-purple-600" />} label="Post Hari Ini" value={stats?.posts_per_day?.slice(-1)[0]?.count || 0} bg="bg-purple-50" />
            <StatCard icon={<List className="w-5 h-5 text-orange-600" />} label="Kata Populer" value={stats?.top_words?.[0]?.text || '-'} bg="bg-orange-50" />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <AdminBarChart data={stats?.posts_per_day || []} title="Post per Hari (30 Hari Terakhir)" xKey="date" />
            <AdminPieChart data={stats?.tag_distribution || []} title="Distribusi Tag" />
          </div>

          {/* Word cloud */}
          <div className="mb-6">
            <AdminWordCloud
              words={stats?.top_words || []}
              title="Kata yang Sering Muncul di Forum"
            />
          </div>

          {/* Top words */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Kata Paling Sering di Judul Post</h3>
            <div className="flex flex-wrap gap-2">
              {(stats?.top_words || []).slice(0, 20).map((w, i) => (
                <span key={i} className="badge bg-emerald-100 text-emerald-700">
                  {w.text} <span className="text-emerald-400 ml-1">{w.value}</span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="card card-hover flex items-center gap-3">
      <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, FileText, Hash } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { AdminBarChart, AdminWordCloud } from '@/components/AdminChart';

interface Stats {
  total_questions: number;
  questions_per_day: { date: string; count: number }[];
  top_words: { text: string; value: number }[];
}

export default function AdminChatDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getChatbotStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-hero admin-hero-chat relative overflow-hidden rounded-2xl text-white p-6 mb-6">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Chatbot</h1>
            <p className="text-white/80 text-sm mt-1">Analitik penggunaan chatbot dan tren pertanyaan</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/chat/pdf" className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <FileText className="w-4 h-4" /> Kelola PDF
            </Link>
            <Link href="/admin/chat/questions" className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <MessageSquare className="w-4 h-4" /> Pertanyaan
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => <div key={i} className="card shimmer h-24" />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={<MessageSquare className="w-5 h-5 text-blue-600" />} label="Total Pertanyaan" value={stats?.total_questions || 0} bg="bg-blue-50" />
            <StatCard icon={<Hash className="w-5 h-5 text-purple-600" />} label="Kata Terpopuler" value={stats?.top_words?.[0]?.text || '-'} bg="bg-purple-50" />
            <StatCard icon={<FileText className="w-5 h-5 text-green-600" />} label="Pertanyaan Hari Ini" value={stats?.questions_per_day?.slice(-1)[0]?.count || 0} bg="bg-green-50" />
          </div>

          {/* Chart */}
          <div className="mb-6">
            <AdminBarChart
              data={stats?.questions_per_day || []}
              title="Pertanyaan per Hari (30 Hari Terakhir)"
              xKey="date"
            />
          </div>

          {/* Word Cloud */}
          <div className="mb-6">
            <AdminWordCloud
              words={stats?.top_words || []}
              title="Kata Paling Sering Ditanyakan"
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="card card-hover flex items-center gap-4">
      <div className={`${bg} rounded-xl p-3`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

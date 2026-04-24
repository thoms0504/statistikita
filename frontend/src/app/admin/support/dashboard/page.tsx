'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Inbox, LifeBuoy, MessageSquare, Send, UserRound } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { AdminBarChart, AdminLineChart, AdminPieChart, AdminWordCloud } from '@/components/AdminChart';

interface SupportStats {
  total_conversations: number;
  open_conversations: number;
  closed_conversations: number;
  total_messages: number;
  user_messages: number;
  admin_messages: number;
  unread_for_admin: number;
  conversations_per_day: { date: string; count: number }[];
  messages_per_day: { date: string; count: number }[];
  status_distribution: { name: string; count: number }[];
  top_words: { text: string; value: number }[];
}

export default function AdminSupportDashboard() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSupportStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const combinedSeries = useMemo(() => {
    const map = new Map<string, { date: string; conversations: number; messages: number }>();

    (stats?.conversations_per_day || []).forEach((item) => {
      map.set(item.date, { date: item.date, conversations: item.count, messages: 0 });
    });

    (stats?.messages_per_day || []).forEach((item) => {
      const existing = map.get(item.date) || { date: item.date, conversations: 0, messages: 0 };
      existing.messages = item.count;
      map.set(item.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [stats]);

  const todayMessages = useMemo(() => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
    return stats?.messages_per_day?.find((item) => item.date === today)?.count || 0;
  }, [stats]);

  return (
    <div className="space-y-6">
      <section className="admin-hero admin-hero-support relative overflow-hidden rounded-2xl text-white p-6">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">Dashboard Chat Admin</p>
            <h1 className="mt-1 text-2xl font-bold">Analitik Bantuan Realtime</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/80">
              Pantau percakapan pengguna, pesan masuk, dan topik bantuan yang paling sering muncul.
            </p>
          </div>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Inbox className="h-4 w-4" /> Buka Inbox
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card shimmer h-28" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<LifeBuoy className="h-5 w-5 text-teal-600" />}
              label="Total Percakapan"
              value={stats?.total_conversations || 0}
              helper={`${stats?.open_conversations || 0} masih aktif`}
              tone="teal"
            />
            <StatCard
              icon={<Inbox className="h-5 w-5 text-rose-600" />}
              label="Belum Dibaca"
              value={stats?.unread_for_admin || 0}
              helper="Pesan user menunggu admin"
              tone="rose"
            />
            <StatCard
              icon={<MessageSquare className="h-5 w-5 text-amber-600" />}
              label="Total Pesan"
              value={stats?.total_messages || 0}
              helper={`${todayMessages} pesan hari ini`}
              tone="amber"
            />
            <StatCard
              icon={<Send className="h-5 w-5 text-sky-600" />}
              label="Balasan Admin"
              value={stats?.admin_messages || 0}
              helper={`${stats?.user_messages || 0} pesan dari user`}
              tone="sky"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AdminLineChart
                data={combinedSeries}
                title="Percakapan Baru vs Pesan Harian"
                lines={[
                  { key: 'conversations', label: 'Percakapan', color: '#14b8a6' },
                  { key: 'messages', label: 'Pesan', color: '#f59e0b' },
                ]}
              />
            </div>
            <AdminPieChart
              data={stats?.status_distribution || []}
              title="Status Percakapan"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <AdminBarChart
              data={stats?.messages_per_day || []}
              title="Pesan Chat Admin per Hari"
              xKey="date"
            />
            <AdminWordCloud
              words={stats?.top_words || []}
              title="Kata Paling Sering dari User"
            />
          </section>

          <section className="card">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Ringkasan Operasional</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <Insight icon={<CheckCircle2 className="h-4 w-4 text-teal-600" />} text={`${stats?.closed_conversations || 0} percakapan sudah ditutup.`} />
              <Insight icon={<UserRound className="h-4 w-4 text-rose-600" />} text={`${stats?.user_messages || 0} pesan masuk dari pengguna.`} />
              <Insight icon={<Send className="h-4 w-4 text-amber-600" />} text={`${stats?.admin_messages || 0} balasan sudah dikirim admin.`} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
  tone: 'teal' | 'rose' | 'amber' | 'sky';
}) {
  const toneClass = {
    teal: 'bg-teal-50',
    rose: 'bg-rose-50',
    amber: 'bg-amber-50',
    sky: 'bg-sky-50',
  }[tone];

  return (
    <div className="card card-hover flex items-center gap-3">
      <div className={`${toneClass} flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
        <p className="truncate text-xs text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

function Insight({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-3 text-sm text-slate-600">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminBarChart, AdminLineChart, AdminPieChart, AdminWordCloud } from '@/components/AdminChart';
import { BarChart2, MessageSquare, Users, Hash, Sparkles, TrendingUp } from 'lucide-react';

interface ChatStats {
  total_questions: number;
  questions_per_day: { date: string; count: number }[];
  top_words: { text: string; value: number }[];
}

interface ForumStats {
  total_posts: number;
  total_answers: number;
  posts_per_day: { date: string; count: number }[];
  tag_distribution: { name: string; count: number }[];
  top_words: { text: string; value: number }[];
}

const ranges = [
  { label: '7 Hari', value: 7 },
  { label: '14 Hari', value: 14 },
  { label: '30 Hari', value: 30 },
];

export default function AdminOverviewPage() {
  const [chat, setChat] = useState<ChatStats | null>(null);
  const [forum, setForum] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminAPI.getChatbotStats(), adminAPI.getForumStats()])
      .then(([chatRes, forumRes]) => {
        setChat(chatRes.data);
        setForum(forumRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chatSeries = useMemo(
    () => (chat?.questions_per_day || []).slice(-range),
    [chat, range]
  );
  const forumSeries = useMemo(
    () => (forum?.posts_per_day || []).slice(-range),
    [forum, range]
  );

  const combinedSeries = useMemo(() => {
    const map = new Map<string, { date: string; chat: number; forum: number }>();
    chatSeries.forEach((item) => {
      map.set(item.date, { date: item.date, chat: item.count, forum: 0 });
    });
    forumSeries.forEach((item) => {
      const existing = map.get(item.date) || { date: item.date, chat: 0, forum: 0 };
      existing.forum = item.count;
      map.set(item.date, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [chatSeries, forumSeries]);

  const avgChat = useMemo(() => {
    if (!chatSeries.length) return 0;
    const total = chatSeries.reduce((sum, item) => sum + item.count, 0);
    return Math.round(total / chatSeries.length);
  }, [chatSeries]);

  const avgForum = useMemo(() => {
    if (!forumSeries.length) return 0;
    const total = forumSeries.reduce((sum, item) => sum + item.count, 0);
    return Math.round(total / forumSeries.length);
  }, [forumSeries]);

  const topTag = forum?.tag_distribution?.[0]?.name || '-';
  const topChatWord = chat?.top_words?.[0]?.text || '-';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-bps-blue text-white p-6">
        <div className="absolute -top-16 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold">
            <BarChart2 className="w-4 h-4" /> Overview Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">Ringkasan Aktivitas Layanan</h1>
          <p className="text-blue-100 mt-1 text-sm max-w-2xl">
            Pantau performa chatbot dan forum, serta temukan tren percakapan pengguna secara cepat.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ranges.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  range === item.value ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card shimmer h-28" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
              label="Total Pertanyaan Chatbot"
              value={chat?.total_questions || 0}
              helper={`Rata-rata ${avgChat}/hari`}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-emerald-600" />}
              label="Total Post Forum"
              value={forum?.total_posts || 0}
              helper={`Rata-rata ${avgForum}/hari`}
            />
            <StatCard
              icon={<Hash className="w-5 h-5 text-purple-600" />}
              label="Tag Terpopuler"
              value={topTag}
              helper="Dari distribusi tag forum"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5 text-amber-600" />}
              label="Kata Populer Chatbot"
              value={topChatWord}
              helper="Dari pertanyaan pengguna"
            />
          </section>

          <section className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AdminLineChart
                data={combinedSeries}
                title="Aktivitas Harian Chatbot vs Forum"
                lines={[
                  { key: 'chat', label: 'Chatbot', color: '#2563eb' },
                  { key: 'forum', label: 'Forum', color: '#10b981' },
                ]}
              />
            </div>
            <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">Insight Cepat</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p>Aktivitas chatbot stabil dengan rata-rata {avgChat} pertanyaan per hari.</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <p>Forum memiliki rata-rata {avgForum} post per hari pada rentang ini.</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p>Topik menonjol saat ini: {topTag} dan kata populer {topChatWord}.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-4">
            <AdminBarChart
              data={chatSeries}
              title="Pertanyaan Chatbot per Hari"
              xKey="date"
            />
            <AdminWordCloud
              words={chat?.top_words || []}
              title="Kata Paling Sering di Chatbot"
            />
          </section>

          <section className="grid lg:grid-cols-3 gap-4">
            <AdminPieChart
              data={forum?.tag_distribution || []}
              title="Distribusi Tag Forum"
            />
            <AdminBarChart
              data={forumSeries}
              title="Post Forum per Hari"
              xKey="date"
            />
            <AdminWordCloud
              words={forum?.top_words || []}
              title="Kata yang Sering Muncul di Forum"
            />
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="card card-hover flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-white/80 border border-white/60 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
        <p className="text-xs text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

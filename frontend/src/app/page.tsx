import Link from 'next/link';
import {
  BarChart2,
  MessageCircle,
  MessageSquare,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Hash,
  MapPin,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimatedNumber from '@/components/AnimatedNumber';

export const dynamic = 'force-dynamic';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace('localhost', '127.0.0.1');

async function getLandingStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const stats = await getLandingStats();
  const statsLoading = !stats;
  const forumTotal = stats?.forum.total_questions ?? 0;
  const chatTotal = stats?.chat.total_questions ?? 0;
  const forumTopWord = stats?.forum.top_words?.[0]?.text || (statsLoading ? '...' : '-');
  const chatTopWord = stats?.chat.top_words?.[0]?.text || (statsLoading ? '...' : '-');

  return (
    <div className="min-h-screen text-slate-900 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-bg opacity-70 pointer-events-none" />
      <div className="fixed inset-0 -z-10 page-fade pointer-events-none" />
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute -top-24 right-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-10 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 border border-white/60 text-slate-700 text-xs px-4 py-2 rounded-full shadow-sm dark:bg-slate-900/70 dark:border-slate-700/60 dark:text-slate-200">
              <BarChart2 className="w-4 h-4 text-bps-blue" />
              BPS Provinsi Lampung
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              StatistiKita
              <span className="block text-xl md:text-2xl text-slate-600 font-medium mt-2">
                Pelayanan Statistik Terpadu
              </span>
            </h1>
            <p className="text-slate-600 text-lg mt-4 max-w-xl">
              Akses statistik resmi dan diskusi komunitas dalam satu platform. Chatbot cerdas membantu
              menemukan data, sementara forum mempertemukan pertanyaan dan jawaban terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/chat"
                className="btn-primary px-7 py-3 text-base flex items-center gap-2 justify-center"
              >
                <MessageCircle className="w-5 h-5" /> Mulai Chat
              </Link>
              <Link
                href="/forum"
                className="btn-secondary px-7 py-3 text-base flex items-center gap-2 justify-center"
              >
                <Users className="w-5 h-5" /> Lihat Forum
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 mt-6 text-xs text-slate-500">
              <span className="chip">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Data resmi BPS
              </span>
              <span className="chip">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Diskusi aktif
              </span>
              <span className="chip">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> Layanan 24/7
              </span>
            </div>
          </div>
          <div className="glass p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Sorotan Keseluruhan</p>
                <h3 className="text-xl font-bold text-slate-800">Dashboard Ringkas</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                {
                  label: 'Total Pertanyaan Forum',
                  value: forumTotal,
                  type: 'number',
                  icon: <MessageSquare className="w-4 h-4 text-blue-600" />,
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Total Pertanyaan Chatbot',
                  value: chatTotal,
                  type: 'number',
                  icon: <MessageCircle className="w-4 h-4 text-emerald-600" />,
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Kata Populer Forum',
                  value: forumTopWord,
                  type: 'text',
                  icon: <Hash className="w-4 h-4 text-purple-600" />,
                  bg: 'bg-purple-50',
                },
                {
                  label: 'Kata Populer Chat',
                  value: chatTopWord,
                  type: 'text',
                  icon: <Sparkles className="w-4 h-4 text-amber-600" />,
                  bg: 'bg-amber-50',
                },
              ].map((item) => (
                <div key={item.label} className="bg-white/80 border border-white/60 rounded-xl p-4 dark:bg-slate-900/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </span>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                  {item.type === 'number' ? (
                    <AnimatedNumber
                      value={Number(item.value) || 0}
                      className={`text-lg font-bold text-slate-900 ${statsLoading ? 'animate-pulse' : ''}`}
                    />
                  ) : (
                    <p className={`text-lg font-bold text-bps-blue mt-1 ${statsLoading ? 'animate-pulse' : ''}`}>
                      {item.value as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 bg-gradient-to-r from-blue-50 via-white to-emerald-50 border border-white/70 rounded-xl p-4 dark:from-slate-900/70 dark:via-slate-900/70 dark:to-slate-800/70 dark:border-slate-700/60">
              <p className="text-sm text-slate-600">
                Kombinasi chatbot dan forum membuat proses pencarian data lebih cepat dan kolaboratif.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Fitur Utama</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Dua layanan inti yang dirancang agar pengguna cepat menemukan data statistik yang relevan.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8 text-blue-600" />}
            title="Chatbot Statistik AI"
            description="Tanyakan apa saja tentang data statistik kepada asisten AI yang terhubung ke dokumen resmi BPS."
            features={['Jawaban berbasis dokumen resmi', 'Riwayat percakapan tersimpan', 'Rekomendasi data terkait']}
            href="/chat"
            cta="Coba Chatbot"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-emerald-600" />}
            title="Forum Diskusi"
            description="Forum tanya jawab ala Stack Overflow untuk komunitas statistik. Bangun diskusi sehat dan kredibel."
            features={['Sistem vote & reputasi', 'Tag topik terstruktur', 'Notifikasi percakapan']}
            href="/forum"
            cta="Mulai Diskusi"
            variant="green"
          />
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { label: 'Data BPS', value: 'Terverifikasi' },
            { label: 'Akses Informasi', value: 'Responsif' },
            { label: 'Komunitas', value: 'Kolaboratif' },
          ].map((stat) => (
            <div key={stat.label} className="card card-hover text-center py-8">
              <p className="text-2xl font-bold text-bps-blue">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Mulai Sekarang, Gratis</h2>
          <p className="text-slate-500 mb-6">
            Daftar akun untuk menggunakan chatbot dan bergabung dalam diskusi forum.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
            Daftar Sekarang <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 border border-white/60 text-slate-700 text-xs px-4 py-2 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Lokasi Kantor
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">BPS Provinsi Lampung</h2>
            <p className="text-slate-600 mt-3 max-w-xl">
              Temukan lokasi kantor BPS Provinsi Lampung untuk layanan tatap muka dan konsultasi statistik.
            </p>
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Alamat</p>
              <p>Jl. Basuki Rahmat No. 54, Teluk Betung, Bandar Lampung</p>
            </div>
          </div>
          <div className="card p-2">
            <div className="rounded-xl overflow-hidden border border-white/60">
              <iframe
                title="Peta BPS Provinsi Lampung"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.867770850239!2d105.25368147587638!3d-5.436979254247291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40d6256287d9d7%3A0x8a6f345d47e20258!2sBadan%20Pusat%20Statistik%20Provinsi%20Lampung!5e0!3m2!1sid!2sid!4v1711166400000!5m2!1sid!2sid"
                className="w-full h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-8 px-4 text-center">
        <p className="text-sm">(c) 2026 StatistiKita - BPS Provinsi Lampung. Semua hak dilindungi.</p>
        <p className="text-xs mt-1 text-slate-400">Jl. Basuki Rahmat No. 54, Teluk Betung, Bandar Lampung</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, features, href, cta, variant = 'blue' }: any) {
  const accent = variant === 'green'
    ? 'from-emerald-50 via-white to-emerald-100'
    : 'from-blue-50 via-white to-blue-100';
  const btnClass = variant === 'green' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white';
  return (
    <div className="card card-hover p-7 flex flex-col">
      <div className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 bg-gradient-to-br ${accent}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4 text-sm leading-relaxed">{description}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}
          </li>
        ))}
      </ul>
      <Link href={href} className={`${btnClass} font-semibold px-5 py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition-colors`}>
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

interface PublicStats {
  forum: {
    total_questions: number;
    top_words: { text: string; value: number }[];
  };
  chat: {
    total_questions: number;
    top_words: { text: string; value: number }[];
  };
}

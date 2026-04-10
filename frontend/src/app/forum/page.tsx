import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import ForumSearchBar from './ForumSearchBar';
import ForumCreateButton from './ForumCreateButton';
import { Post, Tag } from '@/types';
import { ChevronLeft, ChevronRight, MessageSquare, TrendingUp, Hash, Activity, Tag as TagIcon, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace('localhost', '127.0.0.1');

type SearchParams = {
  page?: string;
  search?: string;
  tag?: string;
};

async function getPosts(params: { page: number; per_page: number; search: string; tag: string }) {
  try {
    const qs = new URLSearchParams();
    qs.set('page', String(params.page));
    qs.set('per_page', String(params.per_page));
    if (params.search) qs.set('search', params.search);
    if (params.tag) qs.set('tag', params.tag);
    const res = await fetch(`${API_URL}/api/forum/posts?${qs.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { posts: [], pages: 1, total: 0 };
    const data = await res.json();
    return {
      posts: (data.posts ?? []) as Post[],
      pages: Number(data.pages ?? 1),
      total: Number(data.total ?? 0),
    };
  } catch {
    return { posts: [], pages: 1, total: 0 };
  }
}

async function getTags() {
  try {
    const res = await fetch(`${API_URL}/api/forum/tags`, { cache: 'no-store' });
    if (!res.ok) return [] as Tag[];
    const data = await res.json();
    return (data.tags ?? []) as Tag[];
  } catch {
    return [] as Tag[];
  }
}

function buildForumHref({ search, tag, page }: { search: string; tag: string; page?: number }) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (tag) params.set('tag', tag);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/forum?${query}` : '/forum';
}

export default async function ForumPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : '';

  const [{ posts, pages: totalPages, total }, tags] = await Promise.all([
    getPosts({ page, per_page: 10, search, tag }),
    getTags(),
  ]);

  const totalAnswers = posts.reduce((sum, post) => sum + (post.answer_count || 0), 0);
  const avgAnswers = posts.length ? Math.round(totalAnswers / posts.length) : 0;
  const topTag = (() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags?.forEach((t) => {
        counts[t.name] = (counts[t.name] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || '-';
  })();

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="min-h-screen text-slate-900 relative">
      <div className="fixed inset-0 -z-10 mesh-bg opacity-70 pointer-events-none" />
      <div className="fixed inset-0 -z-10 page-fade pointer-events-none" />
      <Navbar />
      <section className="border-b border-white/10 dark:border-slate-800/60 relative">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-blue-600" /> Forum Diskusi
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {total} pertanyaan terdaftar - Temukan jawaban terbaik bersama komunitas.
              </p>
            </div>
            <ForumCreateButton />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <StatCard
              icon={<Activity className="w-4 h-4 text-blue-600" />}
              label="Pertanyaan Tampil"
              value={posts.length}
              helper="Halaman ini"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
              label="Rata-rata Jawaban"
              value={avgAnswers}
              helper="Per pertanyaan"
            />
            <StatCard
              icon={<Hash className="w-4 h-4 text-amber-600" />}
              label="Topik Populer"
              value={topTag}
              helper="Dari daftar tampil"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,280px] gap-6">
          <div>

            {/* Search */}
            <div className="mb-5">
              <ForumSearchBar initialSearch={search} tag={tag} />
            </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="card py-16 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada pertanyaan</p>
            <ForumCreateButton
              label="Buat Pertanyaan Pertama"
              className="btn-primary mt-4 inline-flex items-center gap-2"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <Link
                  aria-disabled={isFirst}
                  href={buildForumHref({ search, tag, page: page - 1 })}
                  className={`btn-secondary p-2 ${isFirst ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <span className="text-sm text-slate-600">Halaman {page} dari {totalPages}</span>
                <Link
                  aria-disabled={isLast}
                  href={buildForumHref({ search, tag, page: page + 1 })}
                  className={`btn-secondary p-2 ${isLast ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card floating-tags sticky top-[calc(var(--nav-offset)+12px)] z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TagIcon className="w-4 h-4 text-blue-600" /> Tags Populer
                </div>
                {tag && (
                  <Link
                    href={buildForumHref({ search, tag: '', page: 1 })}
                    className="text-xs text-slate-500 hover:text-red-500 inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Hapus
                  </Link>
                )}
              </div>
              {tags.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada tag.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildForumHref({ search, tag: '', page: 1 })}
                    className={`badge px-3 py-1.5 text-xs ${
                      !tag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua
                  </Link>
                  {tags.map((t) => (
                    <Link
                      key={t.id}
                      href={buildForumHref({ search, tag: t.name, page: 1 })}
                      className={`badge px-3 py-1.5 text-xs transition-colors ${
                        tag === t.name ? 'bg-blue-600 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Tips Diskusi</h4>
              <ul className="text-xs text-slate-500 space-y-2">
                <li>Gunakan judul yang jelas dan spesifik.</li>
                <li>Tambahkan tag agar pertanyaan mudah ditemukan.</li>
                <li>Berikan konteks data atau sumber yang kamu gunakan.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
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
      <div className="w-9 h-9 rounded-2xl bg-white/80 border border-white/60 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-base font-bold text-slate-900 truncate">{value}</p>
        <p className="text-xs text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

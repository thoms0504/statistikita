'use client';

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface ForumSearchBarProps {
  initialSearch: string;
  tag: string;
}

export default function ForumSearchBar({ initialSearch, tag }: ForumSearchBarProps) {
  const router = useRouter();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const query = params.toString();
    router.push(query ? `/forum?${query}` : '/forum');
  };

  return <SearchBar onSearch={handleSearch} initialSearch={initialSearch} />;
}

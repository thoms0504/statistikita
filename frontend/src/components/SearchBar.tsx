'use client';

import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (search: string) => void;
  initialSearch?: string;
}

export default function SearchBar({ onSearch, initialSearch = '' }: SearchBarProps) {
  const [search, setSearch] = useState(initialSearch);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          className="input-field pl-9 pr-4"
          placeholder="Cari pertanyaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary px-5">Cari</button>
    </form>
  );
}

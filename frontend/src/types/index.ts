// User types
export interface User {
  id: number;
  nama_lengkap: string;
  username: string;
  email?: string;
  jenis_kelamin?: 'L' | 'P';
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Chat types
export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Forum types
export interface Tag {
  id: number;
  name: string;
}

export interface ReportDetail {
  id: number;
  user_id: number;
  isi_laporan: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  judul: string;
  deskripsi: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
  tags: Tag[];
  vote_count: number;
  answer_count: number;
  report_count?: number;
  user_vote?: number | null;
  post_upvotes?: number;
  post_downvotes?: number;
  answer_upvotes?: number;
  answer_downvotes?: number;
  report_details?: ReportDetail[];
  author?: {
    id: number;
    username: string;
    nama_lengkap: string;
    role?: 'user' | 'admin';
    avatar_url?: string;
  };
}

export interface Answer {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
  report_count?: number;
  user_vote?: number | null;
  author?: {
    id: number;
    username: string;
    nama_lengkap: string;
    role?: 'user' | 'admin';
    avatar_url?: string;
  };
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  ref_id?: number;
}

// PDF file
export interface PDFFile {
  id: number;
  filename: string;
  original_name: string;
  uploaded_at: string;
  uploaded_by?: number;
  uploader?: string;
}

// API Response
export interface PaginatedResponse<T> {
  total: number;
  pages: number;
  current_page: number;
  items?: T[];
}

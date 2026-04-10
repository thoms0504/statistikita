import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data: { nama_lengkap: string; username: string; password: string; jenis_kelamin?: string; email?: string } | FormData) =>
    data instanceof FormData
      ? api.post('/api/auth/register', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/api/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data),
  googleCallback: (code: string) =>
    api.post('/api/auth/google/callback', { code }),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data: { nama_lengkap?: string; username?: string; email?: string; jenis_kelamin?: string } | FormData) =>
    data instanceof FormData
      ? api.put('/api/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put('/api/auth/profile', data),
  logout: () => api.post('/api/auth/logout'),
};

// ─── Chat ────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message: string, session_id?: number) =>
    api.post('/api/chat/message', { message, session_id }),
  getSessions: () => api.get('/api/chat/sessions'),
  getSessionMessages: (sessionId: number) =>
    api.get(`/api/chat/sessions/${sessionId}/messages`),
  deleteSession: (sessionId: number) =>
    api.delete(`/api/chat/sessions/${sessionId}`),
};

// ─── Forum ───────────────────────────────────────────────
export const forumAPI = {
  getPosts: (params?: { page?: number; per_page?: number; search?: string; tag?: string }) =>
    api.get('/api/forum/posts', { params }),
  getPost: (id: number) => api.get(`/api/forum/posts/${id}`),
  createPost: (formData: FormData) =>
    api.post('/api/forum/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id: number, data: object) => api.put(`/api/forum/posts/${id}`, data),
  deletePost: (id: number) => api.delete(`/api/forum/posts/${id}`),
  getMyPosts: (params?: { page?: number }) => api.get('/api/forum/my-posts', { params }),
  addAnswer: (postId: number, content: string) =>
    api.post(`/api/forum/posts/${postId}/answers`, { content }),
  updateAnswer: (answerId: number, content: string) =>
    api.put(`/api/forum/answers/${answerId}`, { content }),
  deleteAnswer: (answerId: number) => api.delete(`/api/forum/answers/${answerId}`),
  vote: (target_type: 'post' | 'answer', target_id: number, value: 1 | -1) =>
    api.post('/api/forum/vote', { target_type, target_id, value }),
  report: (target_type: 'post' | 'answer', target_id: number, isi_laporan: string) =>
    api.post('/api/forum/report', { target_type, target_id, isi_laporan }),
  getTags: () => api.get('/api/forum/tags'),
  getNotifications: () => api.get('/api/forum/notifications'),
  markNotificationRead: (id: number) => api.patch(`/api/forum/notifications/${id}/read`),
};

// ─── Admin ───────────────────────────────────────────────
export const adminAPI = {
  // PDF
  getPDFs: () => api.get('/api/admin/pdfs'),
  uploadPDF: (formData: FormData, config: object = {}) =>
    api.post('/api/admin/pdfs', formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...config }),
  deletePDF: (id: number) => api.delete(`/api/admin/pdfs/${id}`),
  // Chatbot analytics
  getChatbotStats: () => api.get('/api/admin/chatbot/stats'),
  getChatbotQuestions: (params?: object) => api.get('/api/admin/chatbot/questions', { params }),
  deleteChatMessage: (id: number) => api.delete(`/api/admin/chatbot/questions/${id}`),
  // Forum analytics
  getForumStats: () => api.get('/api/admin/forum/stats'),
  getAdminPosts: (params?: object) => api.get('/api/admin/forum/posts', { params }),
  toggleHidePost: (id: number) => api.patch(`/api/admin/forum/posts/${id}/hide`),
  adminDeletePost: (id: number) => api.delete(`/api/admin/forum/posts/${id}`),
  // Users
  getUsers: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get('/api/admin/users', { params }),
  updateUser: (id: number, data: { nama_lengkap?: string; username?: string; email?: string; role?: 'user' | 'admin'; is_active?: boolean }) =>
    api.patch(`/api/admin/users/${id}`, data),
  toggleUserStatus: (id: number, is_active?: boolean) =>
    api.patch(`/api/admin/users/${id}/status`, typeof is_active === 'boolean' ? { is_active } : {}),
  resetUserPassword: (id: number) =>
    api.post(`/api/admin/users/${id}/reset-password`),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
};

// â”€â”€â”€ Public â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const publicAPI = {
  getLandingStats: () => api.get('/api/public/stats'),
};

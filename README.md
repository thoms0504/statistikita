# StatistiKita – Pelayanan Statistik Terpadu BPS Provinsi Lampung

Aplikasi web full-stack dengan **Flask** (backend) + **Next.js** (frontend).

## Fitur Utama
- 🤖 **Chatbot AI** berbasis Gemini API + RAG dari PDF (ChromaDB + LangChain)
- 💬 **Forum Diskusi** seperti Stack Overflow (vote, tag, notifikasi real-time)
- 🔐 **Auth** JWT + Google OAuth
- 👑 **Admin Panel** – PDF management, analitik chatbot & forum

---

## Prasyarat
- Python 3.10+
- Node.js 18+
- MySQL 8+
- Gemini API Key (Google AI Studio)
- Google OAuth credentials

---

## Setup Backend

```bash
cd backend

# 1. Buat virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# atau: venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Salin dan isi .env
cp .env.example .env
# Edit .env: isi MYSQL_DATABASE_URI, GEMINI_API_KEY, GOOGLE_CLIENT_ID, dll.

# 4. Buat database MySQL
mysql -u root -p -e "CREATE DATABASE statistikita_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Jalankan migrasi
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 6. (Opsional) Buat akun admin pertama
python -c "
from app import create_app
from app.models import db
from app.models.user import User
app = create_app()
with app.app_context():
    u = User(nama_lengkap='Admin', username='admin', email='admin@bps.go.id', role='admin')
    u.set_password('admin123')
    db.session.add(u)
    db.session.commit()
    print('Admin created!')
"

# 7. Jalankan server
python run.py
# Backend berjalan di http://localhost:5000
```

---

## Setup Frontend

```bash
cd front

# 1. Install dependencies
npm install

# 2. Salin dan isi .env.local
cp .env.local.example .env.local
# Edit: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID

# 3. Jalankan dev server
npm run dev
# Frontend berjalan di http://localhost:3000
```

---

## Menjalankan Tests

```bash
cd backend
pip install pytest pytest-flask
python -m pytest tests/ -v
```

---

## Struktur Proyek

```
pst_app/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory + SocketIO
│   │   ├── config.py
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routes/              # Blueprint routes (auth, chatbot, forum, admin)
│   │   ├── services/            # rag_service, grok_service, notification_service
│   │   ├── utils/               # jwt_helper
│   │   └── events/              # Socket.IO events
│   ├── pdfs/                    # Uploaded PDFs for RAG
│   ├── chroma_db/               # ChromaDB vector store (auto-generated)
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
└── frontend/
    └── src/
        ├── app/                 # Next.js App Router pages
        ├── components/          # Reusable UI components
        ├── hooks/               # useAuth
        ├── lib/                 # api.ts, socket.ts
        └── types/               # TypeScript types
```

---

## Variabel Environment

### Backend (`backend/.env`)
| Variabel | Keterangan |
|---|---|
| `FLASK_ENV` | `development` / `production` |
| `SECRET_KEY` | Secret key Flask |
| `JWT_SECRET_KEY` | Secret key JWT |
| `MYSQL_DATABASE_URI` | `mysql+pymysql://user:pass@host/db` |
| `GEMINI_API_KEY` | API key Gemini (Google AI Studio) |
| `GEMINI_MODEL` | Model Gemini (contoh: `gemini-3.1-flash-lite-preview`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `FRONTEND_URL` | URL frontend (untuk CORS) |

### Frontend (`frontend/.env.local`)
| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend (default: `http://localhost:5000`) |
| `NEXT_PUBLIC_SOCKET_URL` | URL Socket.IO (sama dengan API) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/auth/google/callback` | — |
| GET | `/api/auth/me` | JWT |
| POST | `/api/auth/logout` | JWT |

### Chatbot
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/chat/message` | JWT |
| GET | `/api/chat/sessions` | JWT |
| GET | `/api/chat/sessions/:id/messages` | JWT |
| DELETE | `/api/chat/sessions/:id` | JWT |

### Forum
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/forum/posts` | — |
| GET | `/api/forum/posts/:id` | — |
| POST | `/api/forum/posts` | JWT |
| POST | `/api/forum/posts/:id/answers` | JWT |
| POST | `/api/forum/vote` | JWT |
| POST | `/api/forum/report` | JWT |
| GET | `/api/forum/notifications` | JWT |

### Admin
| Method | Endpoint | Auth |
|---|---|---|
| GET/POST | `/api/admin/pdfs` | Admin |
| DELETE | `/api/admin/pdfs/:id` | Admin |
| GET | `/api/admin/chatbot/stats` | Admin |
| GET | `/api/admin/forum/stats` | Admin |
| PATCH | `/api/admin/forum/posts/:id/hide` | Admin |

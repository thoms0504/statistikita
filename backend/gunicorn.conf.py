# gunicorn.conf.py
# Konfigurasi Gunicorn untuk Flask-SocketIO dengan eventlet worker
# Dipanggil otomatis oleh gunicorn saat start

import eventlet
import warnings

# ── Patch SEBELUM apapun diimport oleh gunicorn worker ──────────────────────
# Ini menghilangkan warning "RLock(s) were not greened"
def post_fork(server, worker):
    """Hook yang dijalankan di setiap worker setelah fork dari master."""
    eventlet.monkey_patch()
    warnings.filterwarnings("ignore", message=".*RLock.*greened.*")


def pre_exec(server):
    """Hook sebelum exec gunicorn master."""
    server.log.info("Gunicorn master started")


# ── Konfigurasi server ───────────────────────────────────────────────────────
worker_class   = "eventlet"
workers        = 1          # WAJIB 1 untuk SocketIO (tanpa Redis adapter)
threads        = 1
worker_connections = 1000   # max concurrent connections per worker
timeout        = 120        # 2 menit (untuk request panjang seperti PDF ingestion)
keepalive      = 5
graceful_timeout = 30

# ── Logging ──────────────────────────────────────────────────────────────────
accesslog      = "-"        # stdout
errorlog       = "-"        # stderr
loglevel       = "warning"  # hanya tampilkan warning ke atas (bukan info spam)
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(D)sμs'

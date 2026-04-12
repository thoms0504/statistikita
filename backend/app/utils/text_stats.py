import re
from collections import Counter

# ─── Stopwords Bahasa Indonesia ──────────────────────────────────────────────
# Kata ganti
_KATA_GANTI = {
    'saya', 'aku', 'kamu', 'anda', 'dia', 'mereka', 'kita', 'kami', 'kalian',
    'ini', 'itu', 'tersebut', 'beliau', 'ia', 'nya', 'mu', 'ku',
}

# Kata depan & kata hubung
_KATA_DEPAN_HUBUNG = {
    'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'oleh', 'tanpa',
    'tentang', 'terhadap', 'antara', 'melalui', 'mengenai', 'karena', 'sebab',
    'sehingga', 'agar', 'supaya', 'tetapi', 'namun', 'akan', 'tetapi', 'melainkan',
    'bahwa', 'jika', 'kalau', 'apabila', 'ketika', 'saat', 'sewaktu', 'selama',
    'sambil', 'meski', 'walaupun', 'meskipun', 'setelah', 'sebelum', 'sejak',
    'sampai', 'hingga', 'seperti', 'ibarat', 'yaitu', 'yakni', 'maupun',
    'baik', 'dan', 'atau', 'serta', 'pun', 'juga', 'bahkan', 'apalagi',
    'sedangkan', 'padahal', 'sementara', 'kemudian', 'lalu', 'selanjutnya',
    'akhirnya', 'pertama', 'kedua', 'ketiga',
}

# Kata kerja bantu & kopula
_KATA_KERJA_BANTU = {
    'adalah', 'ialah', 'merupakan', 'ada', 'tidak', 'bukan', 'belum', 'sudah',
    'telah', 'sedang', 'akan', 'pernah', 'selalu', 'sering', 'jarang', 'harus',
    'wajib', 'boleh', 'dapat', 'bisa', 'mampu', 'mau', 'ingin', 'hendak',
    'perlu', 'butuh', 'menjadi', 'jadi',
}

# Kata tanya
_KATA_TANYA = {
    'apa', 'apakah', 'siapa', 'kapan', 'dimana', 'bagaimana', 'mengapa', 'kenapa',
    'berapa', 'mana', 'gimana',
}

# Kata keterangan umum
_KATA_KETERANGAN = {
    'sangat', 'lebih', 'paling', 'sekali', 'agak', 'cukup', 'terlalu', 'lumayan',
    'hampir', 'kira', 'sekitar', 'kurang', 'hanya', 'saja', 'juga', 'pula',
    'lagi', 'masih', 'sudah', 'dulu', 'nanti', 'tadi', 'sekarang', 'kini',
    'soon', 'segera', 'cepat', 'lambat', 'lama', 'baru', 'lama', 'lain',
    'semua', 'seluruh', 'setiap', 'tiap', 'masing', 'berbagai', 'banyak',
    'sedikit', 'beberapa', 'sejumlah', 'selain', 'kecuali', 'namun',
}

# Kata seru / filler / informal
_KATA_FILLER = {
    'dong', 'sih', 'nih', 'deh', 'loh', 'lho', 'yah', 'yeah', 'oke', 'oke',
    'okay', 'ok', 'yuk', 'halo', 'hei', 'hai', 'tolong', 'mohon', 'terima',
    'kasih', 'makasih', 'terimakasih', 'selamat', 'hatur', 'nuhun',
}

# Kata umum chatbot / forum yang tidak informatif sebagai topik
_KATA_UMUM_KONTEKS = {
    'data', 'statistik', 'informasi', 'info', 'tahu', 'tau', 'tahun', 'bulan',
    'hari', 'waktu', 'cara', 'hasil', 'nilai', 'angka', 'jumlah', 'total',
    'hal', 'kali', 'jenis', 'macam', 'bentuk', 'contoh', 'misal', 'misalnya',
    'terutama', 'khususnya', 'umumnya', 'biasanya', 'berbeda', 'sama',
    'besar', 'kecil', 'tinggi', 'rendah', 'banyak', 'sedikit', 'pertanyaan',
    'jawaban', 'tanya', 'tanya', 'mohon', 'bantu', 'tolong', 'minta',
    'sumber', 'referensi', 'link', 'lihat', 'cari', 'temukan',
}

# ─── Stopwords English (umum muncul di forum) ────────────────────────────────
_STOPWORDS_EN = {
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
    'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'this', 'that',
    'with', 'have', 'from', 'they', 'will', 'been', 'more', 'when', 'what',
    'there', 'their', 'would', 'could', 'which', 'about', 'where', 'other',
    'into', 'some', 'than', 'then', 'them', 'these', 'your', 'also', 'just',
    'like', 'only', 'over', 'such', 'even', 'most', 'much', 'many', 'very',
    'well', 'back', 'here', 'make', 'know', 'time', 'need', 'want',
}

# Gabungkan semua stopwords
STOPWORDS: set[str] = (
    _KATA_GANTI
    | _KATA_DEPAN_HUBUNG
    | _KATA_KERJA_BANTU
    | _KATA_TANYA
    | _KATA_KETERANGAN
    | _KATA_FILLER
    | _KATA_UMUM_KONTEKS
    | _STOPWORDS_EN
)

# Regex untuk membersihkan teks: hanya ambil huruf (latin + a-z)
_CLEAN_RE = re.compile(r'[^a-zA-Z\u00C0-\u024F]')
_MULTI_SPACE = re.compile(r'\s+')


def _tokenize(text: str) -> list[str]:
    """Bersihkan teks dan tokenisasi jadi kata-kata."""
    # Lowercase
    text = text.lower()
    # Ganti karakter non-huruf dengan spasi
    text = _CLEAN_RE.sub(' ', text)
    text = _MULTI_SPACE.sub(' ', text).strip()
    # Tokenisasi dan filter
    return [
        w for w in text.split()
        if len(w) >= 3          # minimal 3 karakter
        and w not in STOPWORDS  # bukan stopword
        and not w.isdigit()     # bukan angka murni
    ]


def extract_top_words(texts: list[str], top_n: int = 30) -> list[dict]:
    """
    Ekstrak kata paling sering muncul dari daftar teks.
    Mengembalikan list of {'text': word, 'value': count} untuk word cloud.
    """
    words: list[str] = []
    for text in texts:
        if not text:
            continue
        words.extend(_tokenize(text))
    counter = Counter(words)
    return [{'text': word, 'value': count} for word, count in counter.most_common(top_n)]

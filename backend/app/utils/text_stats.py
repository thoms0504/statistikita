import re
from collections import Counter

# =============================================================================
# STOPWORDS BAHASA INDONESIA
# Sumber: masdevid/ID-Stopwords & stopwords-iso/stopwords-id (GitHub)
# https://github.com/masdevid/ID-Stopwords
# https://github.com/stopwords-iso/stopwords-id
# =============================================================================
_STOPWORDS_ID: set[str] = {
    # A
    'ada', 'adalah', 'adanya', 'adapun', 'agak', 'agaknya', 'agar', 'akan',
    'akankah', 'akhir', 'akhiri', 'akhirnya', 'aku', 'akulah', 'amat', 'amatlah',
    'anda', 'andalah', 'antar', 'antara', 'antaranya', 'apa', 'apaan', 'apabila',
    'apakah', 'apalagi', 'apatah', 'artinya', 'asal', 'asalkan', 'atas', 'atau',
    'ataukah', 'ataupun', 'awal', 'awalnya',
    # B
    'bagai', 'bagaikan', 'bagaimana', 'bagaimanakah', 'bagaimanapun', 'bagi',
    'bagian', 'bahkan', 'bahwa', 'bahwasanya', 'baik', 'bakal', 'bakalan',
    'balik', 'banyak', 'bapak', 'baru', 'bawah', 'beberapa', 'begini',
    'beginian', 'beginikah', 'beginilah', 'begitu', 'begitukah', 'begitulah',
    'begitupun', 'bekerja', 'belakang', 'belakangan', 'belum', 'belumlah',
    'benar', 'benarkah', 'benarlah', 'berada', 'berakhir', 'berakhirlah',
    'berakhirnya', 'berapa', 'berapakah', 'berapalah', 'berapapun', 'berarti',
    'berawal', 'berbagai', 'berdatangan', 'beri', 'berikan', 'berikut',
    'berikutnya', 'berjumlah', 'berkata', 'berkehendak', 'berkeinginan',
    'berkenaan', 'berlainan', 'berlalu', 'berlangsung', 'berlebihan', 'bermacam',
    'bermaksud', 'bermula', 'bersama', 'bersiap', 'bertanya', 'berturut',
    'bertutur', 'berujar', 'berupa', 'besar', 'betul', 'betulkah', 'biasa',
    'biasanya', 'bila', 'bilakah', 'bisa', 'bisakah', 'boleh', 'bolehkah',
    'bolehlah', 'buat', 'bukan', 'bukankah', 'bukanlah', 'bukannya', 'bulan',
    'bung',
    # C
    'cara', 'caranya', 'cukup', 'cukupkah', 'cukuplah', 'cuma',
    # D
    'dahulu', 'dalam', 'dan', 'dapat', 'dari', 'daripada', 'datang', 'dekat',
    'demi', 'demikian', 'demikianlah', 'dengan', 'depan', 'di', 'dia',
    'diakhiri', 'diakhirinya', 'dialah', 'diantara', 'diantaranya', 'diberi',
    'diberikan', 'diberikannya', 'dibuat', 'dibuatnya', 'didapat', 'didatangkan',
    'digunakan', 'diibaratkan', 'diibaratkannya', 'diingat', 'diingatkan',
    'diinginkan', 'dijawab', 'dijelaskan', 'dijelaskannya', 'dikarenakan',
    'dikatakan', 'dikatakannya', 'dikerjakan', 'diketahui', 'diketahuinya',
    'dikira', 'dilakukan', 'dilalui', 'dilihat', 'dimaksud', 'dimaksudkan',
    'dimaksudkannya', 'dimaksudnya', 'diminta', 'dimintai', 'dimisalkan',
    'dimulai', 'dimulailah', 'dimulainya', 'dimungkinkan', 'dini', 'dipastikan',
    'diperbuat', 'diperbuatnya', 'dipergunakan', 'diperkirakan', 'diperlihatkan',
    'diperlukan', 'diperlukannya', 'dipersoalkan', 'dipertanyakan', 'dipunyai',
    'diri', 'dirinya', 'disampaikan', 'disebut', 'disebutkan', 'disebutkannya',
    'disini', 'disinilah', 'ditambahkan', 'ditandaskan', 'ditanya', 'ditanyai',
    'ditanyakan', 'ditegaskan', 'ditujukan', 'ditunjuk', 'ditunjuki',
    'ditunjukkan', 'ditunjukkannya', 'ditunjuknya', 'dituturkan', 'dituturkannya',
    'diucapkan', 'diucapkannya', 'diungkapkan', 'dong', 'dua', 'dulu',
    # E
    'empat', 'enggak', 'enggaknya', 'entah', 'entahlah',
    # G
    'guna', 'gunakan',
    # H
    'hal', 'hampir', 'hanya', 'hanyalah', 'hari', 'harus', 'haruslah',
    'harusnya', 'hendak', 'hendaklah', 'hendaknya', 'hingga',
    # I
    'ia', 'ialah', 'ibarat', 'ibaratkan', 'ibaratnya', 'ibu', 'ikut', 'ingat',
    'ingin', 'inginkah', 'inginkan', 'ini', 'inikah', 'inilah', 'itu',
    'itukah', 'itulah',
    # J
    'jadi', 'jadilah', 'jadinya', 'jangan', 'jangankan', 'janganlah', 'jauh',
    'jawab', 'jawaban', 'jawabnya', 'jelas', 'jelaskan', 'jelaslah', 'jelasnya',
    'jika', 'jikalau', 'juga', 'jumlah', 'jumlahnya', 'justru',
    # K
    'kala', 'kalau', 'kalaulah', 'kalaupun', 'kalian', 'kami', 'kamilah',
    'kamu', 'kamulah', 'kan', 'kapan', 'kapankah', 'kapanpun', 'karena',
    'karenanya', 'kasus', 'kata', 'katakan', 'katakanlah', 'katanya', 'ke',
    'keadaan', 'kebetulan', 'kecil', 'kedua', 'keduanya', 'keinginan',
    'kelamaan', 'kelihatan', 'kelihatannya', 'kelima', 'keluar', 'kembali',
    'kemudian', 'kemungkinan', 'kemungkinannya', 'kenapa', 'kepada',
    'kepadanya', 'kesampaian', 'keseluruhan', 'keseluruhannya', 'keterlaluan',
    'ketika', 'khususnya', 'kini', 'kinilah', 'kira', 'kiranya', 'kita',
    'kitalah', 'kok', 'kurang',
    # L
    'lagi', 'lagian', 'lah', 'lain', 'lainnya', 'lalu', 'lama', 'lamanya',
    'lanjut', 'lanjutnya', 'lebih', 'lewat', 'lima', 'luar',
    # M
    'macam', 'maka', 'makanya', 'makin', 'malah', 'malahan', 'mampu',
    'mampukah', 'mana', 'manakala', 'manalagi', 'masa', 'masalah', 'masalahnya',
    'masih', 'masihkah', 'masing', 'mau', 'maupun', 'melainkan', 'melakukan',
    'melalui', 'melihat', 'melihatnya', 'memang', 'memastikan', 'memberi',
    'memberikan', 'membuat', 'memerlukan', 'memihak', 'meminta', 'memintakan',
    'memisalkan', 'memperbuat', 'mempergunakan', 'memperkirakan',
    'memperlihatkan', 'mempersiapkan', 'mempersoalkan', 'mempertanyakan',
    'mempunyai', 'memulai', 'memungkinkan', 'menaiki', 'menambahkan',
    'menandaskan', 'menanti', 'menantikan', 'menanya', 'menanyai', 'menanyakan',
    'mendapat', 'mendapatkan', 'mendatang', 'mendatangi', 'mendatangkan',
    'menegaskan', 'mengakhiri', 'mengapa', 'mengatakan', 'mengatakannya',
    'mengenai', 'mengerjakan', 'mengetahui', 'menggunakan', 'menghendaki',
    'mengibaratkan', 'mengibaratkannya', 'mengingat', 'mengingatkan',
    'menginginkan', 'mengira', 'mengucapkan', 'mengucapkannya', 'mengungkapkan',
    'menjadi', 'menjawab', 'menjelaskan', 'menuju', 'menunjuk', 'menunjuki',
    'menunjukkan', 'menunjuknya', 'menurut', 'menuturkan', 'menyampaikan',
    'menyangkut', 'menyatakan', 'menyebutkan', 'menyeluruh', 'menyiapkan',
    'merasa', 'mereka', 'merekalah', 'merupakan', 'meski', 'meskipun',
    'meyakini', 'meyakinkan', 'minta', 'mirip', 'misal', 'misalkan',
    'misalnya', 'mula', 'mulai', 'mulailah', 'mulanya', 'mungkin', 'mungkinkah',
    # N
    'nah', 'naik', 'namun', 'nanti', 'nantinya', 'nyaris', 'nyatanya',
    # O
    'oleh', 'olehnya',
    # P
    'pada', 'padahal', 'padanya', 'pak', 'paling', 'panjang', 'pantas', 'para',
    'pasti', 'pastilah', 'penting', 'pentingnya', 'per', 'percuma', 'perlu',
    'perlukah', 'perlunya', 'pernah', 'persoalan', 'pertama', 'pertanyaan',
    'pertanyakan', 'pihak', 'pihaknya', 'pukul', 'pula', 'pun', 'punya',
    # R
    'rasa', 'rasanya', 'rata', 'rupanya',
    # S
    'saat', 'saatnya', 'saja', 'sajalah', 'saling', 'sama', 'sambil', 'sampai',
    'sampaikan', 'sana', 'sangat', 'sangatlah', 'satu', 'saya', 'sayalah', 'se',
    'sebab', 'sebabnya', 'sebagai', 'sebagaimana', 'sebagainya', 'sebagian',
    'sebaik', 'sebaiknya', 'sebaliknya', 'sebanyak', 'sebegini', 'sebegitu',
    'sebelum', 'sebelumnya', 'sebenarnya', 'seberapa', 'sebesar', 'sebetulnya',
    'sebisanya', 'sebuah', 'sebut', 'sebutlah', 'sebutnya', 'secara',
    'secukupnya', 'sedang', 'sedangkan', 'sedemikian', 'sedikit', 'sedikitnya',
    'seenaknya', 'segala', 'segalanya', 'segera', 'seharusnya', 'sehingga',
    'seingat', 'sejak', 'sejauh', 'sejenak', 'sejumlah', 'sekadar', 'sekadarnya',
    'sekali', 'sekalian', 'sekaligus', 'sekalipun', 'sekarang', 'sekecil',
    'seketika', 'sekiranya', 'sekitar', 'sekitarnya', 'sekurangnya', 'sela',
    'selagi', 'selain', 'selaku', 'selalu', 'selama', 'selamanya', 'selanjutnya',
    'seluruh', 'seluruhnya', 'semacam', 'semakin', 'semampu', 'semampunya',
    'semasa', 'semasih', 'semata', 'semaunya', 'sementara', 'semisal',
    'semisalnya', 'sempat', 'semua', 'semuanya', 'semula', 'sendiri',
    'sendirian', 'sendirinya', 'seolah', 'seorang', 'sepanjang', 'sepantasnya',
    'seperlunya', 'seperti', 'sepertinya', 'sepihak', 'sering', 'seringnya',
    'serta', 'serupa', 'sesaat', 'sesama', 'sesampai', 'sesegera', 'sesekali',
    'seseorang', 'sesuatu', 'sesuatunya', 'sesudah', 'sesudahnya', 'setelah',
    'setempat', 'setengah', 'seterusnya', 'setiap', 'setiba', 'setibanya',
    'setidaknya', 'setinggi', 'seusai', 'sewaktu', 'siap', 'siapa', 'siapakah',
    'siapapun', 'sini', 'sinilah', 'soal', 'soalnya', 'suatu', 'sudah',
    'sudahkah', 'sudahlah', 'supaya',
    # T
    'tadi', 'tadinya', 'tahu', 'tahun', 'tak', 'tambah', 'tambahnya', 'tampak',
    'tampaknya', 'tandas', 'tandasnya', 'tanpa', 'tanya', 'tanyakan', 'tanyanya',
    'tapi', 'tegas', 'tegasnya', 'telah', 'tempat', 'tengah', 'tentang',
    'tentu', 'tentulah', 'tentunya', 'tepat', 'terakhir', 'terasa', 'terbanyak',
    'terdahulu', 'terdapat', 'terdiri', 'terhadap', 'terhadapnya', 'teringat',
    'terjadi', 'terjadilah', 'terjadinya', 'terkira', 'terlalu', 'terlebih',
    'terlihat', 'termasuk', 'ternyata', 'tersampaikan', 'tersebut',
    'tersebutlah', 'tertentu', 'tertuju', 'terus', 'terutama', 'tetap',
    'tetapi', 'tiap', 'tiba', 'tidak', 'tidakkah', 'tidaklah', 'tiga',
    'tinggi', 'toh', 'tunjuk', 'turut', 'tutur', 'tuturnya',
    # U
    'ucap', 'ucapnya', 'ujar', 'ujarnya', 'umum', 'umumnya', 'ungkap',
    'ungkapnya', 'untuk', 'usah', 'usai',
    # W
    'waduh', 'wah', 'wahai', 'waktu', 'waktunya', 'walau', 'walaupun', 'wong',
    # Y
    'yaitu', 'yakin', 'yakni', 'yang',
    # Tambahan informal / chatbot
    'dong', 'sih', 'nih', 'deh', 'loh', 'lho', 'yah', 'oke', 'okay', 'ok',
    'yuk', 'halo', 'hei', 'hai', 'makasih', 'terimakasih', 'selamat',
    'gimana', 'gini', 'gitu', 'banget', 'emang', 'kayak', 'udah', 'udh',
    'ngga', 'nggak', 'gak', 'ngak', 'blm', 'sdh', 'yg', 'dgn', 'utk',
    'krn', 'kalo', 'aja', 'jg', 'kita', 'tsb', 'svp',
}

# =============================================================================
# STOPWORDS ENGLISH
# Sumber: NLTK English stopwords corpus
# =============================================================================
_STOPWORDS_EN: set[str] = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
    'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'any', 'could', 'would', 'may',
    'might', 'shall', 'shan', 'mustn', 'also', 'like', 'well', 'get', 'got',
    'make', 'know', 'see', 'use', 'used', 'need', 'want', 'way', 'even',
    'back', 'come', 'think', 'look', 'much', 'many', 'new', 'old', 'time',
    'day', 'year', 'one', 'two', 'three', 'first', 'last', 'long', 'great',
    'little', 'own', 'right', 'big', 'high', 'different', 'small', 'large',
    'next', 'early', 'young', 'important', 'public', 'private', 'real',
    'best', 'free', 'sure', 'every', 'thing', 'number', 'part', 'place',
    'case', 'week', 'company', 'system', 'program', 'question', 'during',
    'always', 'never', 'often', 'late', 'since', 'without', 'within',
    'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except',
    'give', 'find', 'ask', 'tell', 'call', 'keep', 'try', 'put', 'mean',
    'become', 'leave', 'show', 'feel', 'seem', 'point', 'turn', 'start',
    'however', 'therefore', 'although', 'though', 'whereas', 'whether',
}

# =============================================================================
# Gabungkan semua stopwords
# =============================================================================
STOPWORDS: set[str] = _STOPWORDS_ID | _STOPWORDS_EN

# Regex: hanya pertahankan huruf (latin dasar, diacritic eropa dihapus karena
# bahasa Indonesia tidak menggunakannya)
_CLEAN_RE = re.compile(r'[^a-z]')
_MULTI_SPACE = re.compile(r'\s+')


def _tokenize(text: str) -> list[str]:
    """Ubah teks menjadi token yang sudah dibersihkan."""
    text = text.lower()
    text = _CLEAN_RE.sub(' ', text)
    text = _MULTI_SPACE.sub(' ', text).strip()
    return [
        w for w in text.split()
        if len(w) >= 3
        and w not in STOPWORDS
    ]


def extract_top_words(texts: list[str], top_n: int = 30) -> list[dict]:
    """
    Ekstrak kata paling sering muncul dari daftar teks.
    Stopwords dari: masdevid/ID-Stopwords + stopwords-iso/stopwords-id + NLTK English.
    Mengembalikan list of {'text': word, 'value': count} untuk word cloud.
    """
    words: list[str] = []
    for text in texts:
        if not text:
            continue
        words.extend(_tokenize(text))
    counter = Counter(words)
    return [{'text': word, 'value': count} for word, count in counter.most_common(top_n)]

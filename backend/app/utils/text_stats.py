from collections import Counter

STOPWORDS_ID = {
    'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk', 'adalah',
    'dalam', 'pada', 'tidak', 'saya', 'anda', 'bisa', 'ada', 'akan', 'sudah',
    'atau', 'juga', 'lebih', 'seperti', 'bagaimana', 'apa', 'apakah', 'berapa',
    'kapan', 'dimana', 'siapa', 'mengapa', 'tentang', 'data', 'statistik'
}


def extract_top_words(texts, top_n=20):
    words = []
    for text in texts:
        if not text:
            continue
        words.extend([w.lower() for w in text.split() if len(w) > 3 and w.lower() not in STOPWORDS_ID])
    counter = Counter(words)
    return [{'text': word, 'value': count} for word, count in counter.most_common(top_n)]

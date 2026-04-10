-- ============================================================
--  StatistiKita – Dummy Data (FINAL FIXED)
--  Jalankan di phpMyAdmin: pilih database statistikita_db
--  klik tab SQL, paste semua ini, klik Go
-- ============================================================

USE statistikita_db;

-- ============================================================
-- LANGKAH 0: Matikan foreign key check, truncate semua tabel,
--            nyalakan lagi. Cara ini paling aman dan pasti work.
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM reports;
ALTER TABLE reports AUTO_INCREMENT = 1;
DELETE FROM notifications;
ALTER TABLE notifications AUTO_INCREMENT = 1;
DELETE FROM votes;
ALTER TABLE votes AUTO_INCREMENT = 1;
DELETE FROM post_tags;
DELETE FROM chat_messages;
ALTER TABLE chat_messages AUTO_INCREMENT = 1;
DELETE FROM chat_sessions;
ALTER TABLE chat_sessions AUTO_INCREMENT = 1;
DELETE FROM answers;
ALTER TABLE answers AUTO_INCREMENT = 1;
DELETE FROM posts;
ALTER TABLE posts AUTO_INCREMENT = 1;
DELETE FROM tags;
ALTER TABLE tags AUTO_INCREMENT = 1;
DELETE FROM pdf_files;
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS  (password semua akun = "password123")
-- ============================================================
INSERT INTO users (id, nama_lengkap, username, email, jenis_kelamin, password_hash, role, is_active, created_at) VALUES
(1,  'Administrator BPS', 'admin',     'admin@bps.go.id',   'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'admin', 1, NOW() - INTERVAL 60 DAY),
(2,  'Budi Santoso',      'budi_s',    'budi@gmail.com',    'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 45 DAY),
(3,  'Sari Dewi',         'sari_dewi', 'sari@gmail.com',    'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 40 DAY),
(4,  'Ahmad Fauzi',       'ahmad_f',   'ahmad@yahoo.com',   'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 35 DAY),
(5,  'Rina Marlina',      'rina_m',    'rina@gmail.com',    'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 30 DAY),
(6,  'Deni Kurniawan',    'deni_k',    'deni@outlook.com',  'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 25 DAY),
(7,  'Maya Putri',        'maya_p',    'maya@gmail.com',    'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 20 DAY),
(8,  'Hendra Wijaya',     'hendra_w',  'hendra@gmail.com',  'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 15 DAY),
(9,  'Lestari Ningrum',   'lestari_n', 'lestari@gmail.com', 'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 10 DAY),
(10, 'Rizky Pratama',     'rizky_p',   'rizky@gmail.com',   'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user',  1, NOW() - INTERVAL 5 DAY);

-- ============================================================
-- 2. TAGS
-- ============================================================
INSERT INTO tags (id, name) VALUES
(1,'statistik'),(2,'sensus'),(3,'penduduk'),(4,'ekonomi'),(5,'inflasi'),
(6,'kemiskinan'),(7,'pendidikan'),(8,'kesehatan'),(9,'pertanian'),(10,'lampung'),
(11,'data-bps'),(12,'indeks'),(13,'survei'),(14,'pdrb'),(15,'tenaga-kerja');

-- ============================================================
-- 3. POSTS
-- ============================================================
INSERT INTO posts (id, user_id, judul, deskripsi, file_path, is_hidden, created_at, updated_at) VALUES
(1, 2, 'Bagaimana cara membaca tabel statistik BPS Provinsi Lampung?',
 'Saya baru pertama kali mengakses data dari website BPS Lampung. Ada banyak tabel dengan angka-angka yang saya kurang pahami. Apakah ada panduan cara membaca dan menginterpretasikan tabel statistik tersebut? Khususnya tabel yang berisi data penduduk per kabupaten.',
 NULL, 0, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),

(2, 3, 'Apa perbedaan antara Sensus Penduduk dan Survei Penduduk Antar Sensus (SUPAS)?',
 'Saya sering mendengar dua istilah ini dalam konteks data kependudukan Indonesia. Bisa dijelaskan apa perbedaan mendasarnya? Kapan masing-masing dilaksanakan dan apa tujuan utamanya?',
 NULL, 0, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 28 DAY),

(3, 4, 'Berapa jumlah penduduk Provinsi Lampung berdasarkan data terbaru BPS?',
 'Saya membutuhkan data jumlah penduduk Provinsi Lampung terbaru untuk keperluan penelitian skripsi. Mohon informasinya beserta sumber dan tahun datanya. Apakah bisa dirinci per kabupaten/kota?',
 NULL, 0, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),

(4, 5, 'Apa yang dimaksud dengan PDRB dan bagaimana cara menghitungnya?',
 'Dalam laporan ekonomi daerah sering disebut istilah PDRB. Saya ingin memahami apa pengertiannya, apa bedanya dengan PDB nasional, dan bagaimana BPS menghitung angka ini?',
 NULL, 0, NOW() - INTERVAL 23 DAY, NOW() - INTERVAL 23 DAY),

(5, 6, 'Bagaimana cara mengunduh data mikro dari website BPS?',
 'Saya perlu data mikro untuk keperluan analisis statistik lanjutan. Apakah BPS menyediakan data mikro yang bisa diunduh publik? Bagaimana prosedur mendapatkannya dan apa saja formatnya?',
 NULL, 0, NOW() - INTERVAL 21 DAY, NOW() - INTERVAL 21 DAY),

(6, 7, 'Apa indikator yang digunakan BPS untuk mengukur tingkat kemiskinan?',
 'Saya membaca berita tentang penurunan angka kemiskinan di Lampung. Indikator apa saja yang BPS gunakan untuk mengukur kemiskinan? Apakah hanya berdasarkan pendapatan saja atau ada faktor lain?',
 NULL, 0, NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY),

(7, 8, 'Bagaimana cara menginterpretasikan angka inflasi bulanan dari BPS?',
 'BPS setiap bulan merilis data inflasi. Saya ingin memahami cara membaca rilis tersebut. Apa itu inflasi month to month, year on year, dan calendar year? Apa bedanya?',
 NULL, 0, NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 17 DAY),

(8, 9, 'Apakah data BPS bisa digunakan untuk penelitian akademik?',
 'Saya mahasiswa yang sedang mengerjakan tugas akhir. Apakah data yang dipublikasikan BPS boleh digunakan untuk penelitian akademik? Bagaimana cara mencantumkan sumbernya dalam daftar pustaka?',
 NULL, 0, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),

(9, 10, 'Apa perbedaan antara angka absolut dan relatif dalam laporan statistik?',
 'Ketika membaca laporan BPS, kadang data disajikan dalam bentuk angka absolut seperti jumlah jiwa, kadang relatif seperti persentase. Kapan sebaiknya menggunakan masing-masing?',
 NULL, 0, NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 13 DAY),

(10, 2, 'Bagaimana tren angka pengangguran di Lampung beberapa tahun terakhir?',
 'Saya ingin mengetahui tren Tingkat Pengangguran Terbuka (TPT) di Provinsi Lampung dalam 5 tahun terakhir. Ada data yang tersedia dan bagaimana perbandingannya dengan rata-rata nasional?',
 NULL, 0, NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 11 DAY),

(11, 3, 'Apa itu Indeks Pembangunan Manusia (IPM) dan komponen apa yang mempengaruhinya?',
 'Saya sering melihat angka IPM dalam laporan pembangunan daerah. Ingin memahami: apa itu IPM, bagaimana cara menghitungnya, dan apa saja dimensi yang diukur menurut metodologi BPS?',
 NULL, 0, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),

(12, 4, 'Bagaimana cara akses data Sakernas (Survei Angkatan Kerja Nasional)?',
 'Untuk penelitian ketenagakerjaan, saya membutuhkan data dari Sakernas. Bagaimana cara mengaksesnya? Apakah perlu registrasi khusus? Data tahun berapa saja yang tersedia?',
 NULL, 0, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),

(13, 5, 'Apa perbedaan antara data primer dan data sekunder dalam statistik?',
 'Dalam metodologi penelitian sering disebut data primer dan sekunder. Dalam konteks statistik BPS, data mana yang termasuk primer dan mana yang sekunder?',
 NULL, 0, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),

(14, 6, 'Bagaimana cara membandingkan data statistik antar provinsi di Indonesia?',
 'Saya ingin membandingkan berbagai indikator statistik Lampung dengan provinsi lain di Sumatera. Apakah ada platform dari BPS yang memudahkan perbandingan data antar provinsi?',
 NULL, 0, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),

(15, 7, 'Apa itu Nilai Tukar Petani (NTP) dan mengapa penting bagi sektor pertanian?',
 'Lampung adalah provinsi agraris. Saya ingin memahami indikator NTP yang sering muncul dalam laporan BPS. Apa pengertiannya dan apa artinya bila NTP di bawah 100?',
 NULL, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY);

-- ============================================================
-- 4. POST_TAGS
-- ============================================================
INSERT INTO post_tags (post_id, tag_id) VALUES
(1,1),(1,11),(2,2),(2,3),(3,3),(3,10),(4,14),(4,4),
(5,11),(5,1),(6,6),(6,10),(7,5),(7,4),(8,1),(8,13),
(9,12),(9,4),(10,15),(10,10),(11,12),(11,8),(12,15),(12,13),
(13,1),(13,13),(14,10),(14,1),(15,9),(15,10);

-- ============================================================
-- 5. ANSWERS
-- ============================================================
INSERT INTO answers (id, post_id, user_id, content, created_at, updated_at) VALUES
(1, 1, 1,
'Untuk membaca tabel statistik BPS, perhatikan beberapa hal:\n1. Judul tabel menjelaskan variabel dan tahunnya\n2. Baris biasanya adalah wilayah, kolom adalah tahun\n3. Perhatikan satuan di header seperti jiwa, persen, atau ribu rupiah\n4. Baca catatan kaki untuk penjelasan metodologi\n\nAkses langsung di https://lampung.bps.go.id dan pilih menu Tabel Statistik.',
NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY),

(2, 1, 3,
'Tambahan: untuk data penduduk per kabupaten, cari di menu Kependudukan lalu pilih Jumlah Penduduk. Datanya berformat tabel silang dengan kabupaten di baris dan jenis kelamin di kolom.',
NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 28 DAY),

(3, 2, 2,
'Perbedaan utamanya:\n\nSensus Penduduk dilakukan setiap 10 tahun sekali (2000, 2010, 2020), mencakup SELURUH penduduk Indonesia.\n\nSUPAS dilakukan di antara dua sensus menggunakan metode sampel, tujuannya mengupdate proyeksi penduduk antar sensus.\n\nJadi SUPAS adalah jembatan data antara dua sensus.',
NOW() - INTERVAL 27 DAY, NOW() - INTERVAL 27 DAY),

(4, 3, 1,
'Berdasarkan Sensus Penduduk 2020, jumlah penduduk Provinsi Lampung adalah 9.007.848 jiwa dengan kepadatan 254 jiwa per km2.\n\nRincian terbesar:\n- Lampung Tengah sekitar 1,3 juta jiwa\n- Bandar Lampung sekitar 1 juta jiwa\n- Lampung Selatan sekitar 1 juta jiwa',
NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 24 DAY),

(5, 3, 4,
'Untuk skripsi, gunakan publikasi resmi Lampung Dalam Angka yang diterbitkan BPS setiap tahun. Data penduduk sudah dirinci per kabupaten lengkap dengan jenis kelamin dan kelompok umur.',
NOW() - INTERVAL 23 DAY, NOW() - INTERVAL 23 DAY),

(6, 4, 2,
'PDRB adalah nilai total barang dan jasa yang dihasilkan suatu daerah dalam satu tahun.\n\nAda 3 pendekatan menghitung PDRB:\n1. Pendekatan Produksi: menjumlahkan nilai tambah semua sektor\n2. Pendekatan Pengeluaran: C + I + G + (X - M)\n3. Pendekatan Pendapatan: menjumlahkan pendapatan faktor produksi',
NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 22 DAY),

(7, 5, 1,
'BPS menyediakan data gratis:\n- Publikasi PDF di bps.go.id\n- Tabel dinamis di website BPS\n\nData Mikro perlu permintaan melalui mikrodata.bps.go.id. Format tersedia: CSV, SAV (SPSS), DTA (Stata). Untuk penelitian akademik biasanya disetujui.',
NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),

(8, 6, 5,
'BPS mengukur kemiskinan menggunakan Garis Kemiskinan. Seseorang dianggap miskin jika pengeluaran per kapita per bulan di bawah batas tersebut.\n\nGaris Kemiskinan terdiri dari:\n1. Garis Kemiskinan Makanan: kebutuhan 2.100 kkal per hari\n2. Garis Kemiskinan Non-Makanan: perumahan, pendidikan, kesehatan',
NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY),

(9, 7, 3,
'Inflasi BPS disajikan dalam 3 format:\n1. Month-to-Month (m-to-m): perubahan vs bulan lalu\n2. Year-on-Year (y-on-y): perubahan vs bulan yang sama tahun lalu (paling sering dikutip media)\n3. Calendar Year: kumulatif sejak Januari',
NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 16 DAY),

(10, 8, 1,
'Ya, data BPS boleh digunakan untuk penelitian akademik karena merupakan data publik pemerintah.\n\nCara sitasi APA 7th:\nBadan Pusat Statistik Provinsi Lampung. (2024). Lampung Dalam Angka 2024. BPS Provinsi Lampung. https://lampung.bps.go.id',
NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY),

(11, 9, 6,
'Angka absolut adalah nilai mentah contohnya 500.000 jiwa miskin. Angka relatif adalah perbandingan terhadap total contohnya 12,5 persen.\n\nGunakan absolut untuk mengetahui skala masalah. Gunakan relatif untuk membandingkan antar wilayah berbeda ukuran populasi.',
NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),

(12, 10, 7,
'TPT Lampung beberapa tahun terakhir:\n- 2020: 4,67 persen (naik akibat pandemi)\n- 2021: 4,69 persen\n- 2022: 4,52 persen\n- 2023: 4,23 persen\n\nRata-rata TPT nasional sekitar 5,3 persen, jadi Lampung masih di bawah rata-rata nasional.',
NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),

(13, 11, 2,
'IPM mengukur pembangunan manusia dari 3 dimensi:\n1. Umur Harapan Hidup\n2. Harapan Lama Sekolah dan Rata-rata Lama Sekolah\n3. Pengeluaran per Kapita\n\nNilai IPM antara 0-100. IPM Lampung 2023 sekitar 72 (kategori Tinggi). Nasional sekitar 74.',
NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

(14, 12, 8,
'Untuk akses data Sakernas:\n1. Kunjungi https://mikrodata.bps.go.id\n2. Daftar akun\n3. Cari Sakernas, pilih tahun\n4. Klik Ajukan Akses dan isi formulir\n\nProses approval 1-3 hari kerja. Format: SAV (SPSS) dan CSV.',
NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY),

(15, 14, 9,
'BPS punya fitur Tabel Dinamis di bps.go.id:\n1. Pilih menu Data, lalu Tabel Dinamis\n2. Pilih variabel yang ingin dibandingkan\n3. Centang beberapa provinsi sekaligus\n4. Export ke Excel\n\nBisa juga gunakan Satu Data Indonesia di data.go.id.',
NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

(16, 15, 4,
'NTP = (Indeks Harga Diterima Petani / Indeks Harga Dibayar Petani) x 100\n\nInterpretasi:\n- NTP > 100: petani surplus, daya beli meningkat\n- NTP = 100: impas\n- NTP < 100: petani defisit, biaya lebih tinggi dari pendapatan\n\nNTP Lampung biasanya 100-110, artinya petani masih surplus.',
NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR);

-- ============================================================
-- 6. VOTES
-- ============================================================
INSERT INTO votes (user_id, target_type, target_id, value) VALUES
(3,'post',1,1),(4,'post',1,1),(5,'post',1,1),
(5,'post',2,1),(6,'post',2,1),
(7,'post',3,1),(8,'post',3,1),(9,'post',3,1),
(3,'post',4,1),(4,'post',4,1),
(4,'post',7,1),(5,'post',7,1),(6,'post',7,1),
(7,'post',11,1),(8,'post',11,1),
(9,'post',15,1),(10,'post',15,1),
(3,'answer',1,1),(4,'answer',1,1),(5,'answer',1,1),
(2,'answer',3,1),(6,'answer',3,1),
(7,'answer',4,1),(8,'answer',4,1),
(2,'answer',6,1),(3,'answer',6,1),(9,'answer',6,1),
(4,'answer',8,1),(5,'answer',8,1),
(10,'answer',10,1),(2,'answer',10,1);

-- ============================================================
-- 7. CHAT SESSIONS & MESSAGES
-- ============================================================
INSERT INTO chat_sessions (id, user_id, title, created_at) VALUES
(1, 2, 'Pertanyaan tentang data penduduk Lampung', NOW() - INTERVAL 20 DAY),
(2, 2, 'Cara download data BPS',                   NOW() - INTERVAL 10 DAY),
(3, 3, 'Penjelasan tentang inflasi',               NOW() - INTERVAL 15 DAY),
(4, 4, 'Data kemiskinan Lampung',                  NOW() - INTERVAL 8 DAY),
(5, 5, 'Tentang PDRB Lampung',                     NOW() - INTERVAL 5 DAY);

INSERT INTO chat_messages (session_id, role, content, created_at) VALUES
(1,'user',      'Berapa jumlah penduduk Lampung sekarang?',
                NOW() - INTERVAL 20 DAY),
(1,'assistant', 'Berdasarkan Sensus Penduduk 2020, jumlah penduduk Provinsi Lampung adalah 9.007.848 jiwa. Untuk proyeksi terbaru cek di lampung.bps.go.id.',
                NOW() - INTERVAL 20 DAY),
(1,'user',      'Kabupaten mana yang paling padat penduduknya?',
                NOW() - INTERVAL 20 DAY),
(1,'assistant', 'Kota Bandar Lampung memiliki kepadatan tertinggi sekitar 4.600 jiwa per km2. Untuk jumlah terbanyak secara absolut, Lampung Tengah di posisi pertama.',
                NOW() - INTERVAL 20 DAY),
(2,'user',      'Bagaimana cara download data BPS secara gratis?',
                NOW() - INTERVAL 10 DAY),
(2,'assistant', 'Kunjungi bps.go.id, pilih menu Publikasi untuk PDF atau Tabel Statistik untuk Excel. Semua publikasi BPS tersedia gratis untuk publik.',
                NOW() - INTERVAL 10 DAY),
(3,'user',      'Apa itu inflasi dan bagaimana BPS mengukurnya?',
                NOW() - INTERVAL 15 DAY),
(3,'assistant', 'Inflasi adalah kenaikan harga barang dan jasa secara umum. BPS mengukurnya menggunakan Indeks Harga Konsumen dari survei harga di 90 kota setiap bulan.',
                NOW() - INTERVAL 15 DAY),
(4,'user',      'Berapa persentase kemiskinan di Lampung?',
                NOW() - INTERVAL 8 DAY),
(4,'assistant', 'Tingkat kemiskinan Lampung sekitar 11-12 persen, masih di atas rata-rata nasional 9 persen. BPS mengukurnya berdasarkan Garis Kemiskinan yang mencakup kebutuhan makanan dan non-makanan.',
                NOW() - INTERVAL 8 DAY),
(5,'user',      'Sektor apa yang paling besar kontribusinya ke PDRB Lampung?',
                NOW() - INTERVAL 5 DAY),
(5,'assistant', 'Kontributor terbesar PDRB Lampung: Pertanian sekitar 30 persen, Industri Pengolahan sekitar 18 persen, dan Perdagangan sekitar 13 persen.',
                NOW() - INTERVAL 5 DAY);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, type, message, is_read, created_at, ref_id) VALUES
(2,'new_answer','admin menjawab pertanyaan Anda: Bagaimana cara membaca tabel statistik BPS',      1, NOW() - INTERVAL 29 DAY, 1),
(2,'new_answer','sari_dewi menjawab pertanyaan Anda: Bagaimana cara membaca tabel statistik BPS',  1, NOW() - INTERVAL 28 DAY, 1),
(3,'new_answer','budi_s menjawab pertanyaan Anda: Apa perbedaan Sensus Penduduk dan SUPAS',       1, NOW() - INTERVAL 27 DAY, 2),
(4,'new_answer','admin menjawab pertanyaan Anda: Berapa jumlah penduduk Provinsi Lampung',        1, NOW() - INTERVAL 24 DAY, 3),
(4,'new_answer','ahmad_f menjawab pertanyaan Anda: Berapa jumlah penduduk Provinsi Lampung',      0, NOW() - INTERVAL 23 DAY, 3),
(5,'new_answer','budi_s menjawab pertanyaan Anda: Apa yang dimaksud dengan PDRB',                 0, NOW() - INTERVAL 22 DAY, 4),
(6,'new_answer','admin menjawab pertanyaan Anda: Bagaimana cara mengunduh data mikro dari BPS',   0, NOW() - INTERVAL 20 DAY, 5),
(2,'new_answer','maya_p menjawab pertanyaan Anda: Bagaimana tren angka pengangguran di Lampung',  0, NOW() - INTERVAL 10 DAY, 10);

-- ============================================================
-- 9. REPORTS
-- ============================================================
INSERT INTO reports (user_id, target_type, target_id, isi_laporan, created_at) VALUES
(9, 'post', 5, 'Pertanyaan ini sepertinya duplikat dari post lain.',         NOW() - INTERVAL 18 DAY),
(10,'post', 9, 'Pertanyaan kurang relevan dengan topik statistik BPS.',      NOW() - INTERVAL 10 DAY);

-- ============================================================
-- VERIFIKASI: cek jumlah data per tabel
-- ============================================================
SELECT 'users'         AS tabel, COUNT(*) AS jumlah FROM users         UNION ALL
SELECT 'tags',                   COUNT(*)            FROM tags          UNION ALL
SELECT 'posts',                  COUNT(*)            FROM posts         UNION ALL
SELECT 'post_tags',              COUNT(*)            FROM post_tags     UNION ALL
SELECT 'answers',                COUNT(*)            FROM answers       UNION ALL
SELECT 'votes',                  COUNT(*)            FROM votes         UNION ALL
SELECT 'chat_sessions',          COUNT(*)            FROM chat_sessions UNION ALL
SELECT 'chat_messages',          COUNT(*)            FROM chat_messages UNION ALL
SELECT 'notifications',          COUNT(*)            FROM notifications UNION ALL
SELECT 'reports',                COUNT(*)            FROM reports;

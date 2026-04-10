-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2026 at 11:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `statistikita_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `alembic_version`
--

CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alembic_version`
--

INSERT INTO `alembic_version` (`version_num`) VALUES
('ec22c756e8a8');

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(2, 1, 3, 'Tambahan: untuk data penduduk per kabupaten, cari di menu Kependudukan lalu pilih Jumlah Penduduk. Datanya berformat tabel silang dengan kabupaten di baris dan jenis kelamin di kolom.', '2026-02-17 21:58:49', '2026-02-17 21:58:49'),
(3, 2, 2, 'Perbedaan utamanya:\n\nSensus Penduduk dilakukan setiap 10 tahun sekali (2000, 2010, 2020), mencakup SELURUH penduduk Indonesia.\n\nSUPAS dilakukan di antara dua sensus menggunakan metode sampel, tujuannya mengupdate proyeksi penduduk antar sensus.\n\nJadi SUPAS adalah jembatan data antara dua sensus.', '2026-02-18 21:58:49', '2026-02-18 21:58:49'),
(5, 3, 4, 'Untuk skripsi, gunakan publikasi resmi Lampung Dalam Angka yang diterbitkan BPS setiap tahun. Data penduduk sudah dirinci per kabupaten lengkap dengan jenis kelamin dan kelompok umur.', '2026-02-22 21:58:49', '2026-02-22 21:58:49'),
(6, 4, 2, 'PDRB adalah nilai total barang dan jasa yang dihasilkan suatu daerah dalam satu tahun.\n\nAda 3 pendekatan menghitung PDRB:\n1. Pendekatan Produksi: menjumlahkan nilai tambah semua sektor\n2. Pendekatan Pengeluaran: C + I + G + (X - M)\n3. Pendekatan Pendapatan: menjumlahkan pendapatan faktor produksi', '2026-02-23 21:58:49', '2026-02-23 21:58:49'),
(8, 6, 5, 'BPS mengukur kemiskinan menggunakan Garis Kemiskinan. Seseorang dianggap miskin jika pengeluaran per kapita per bulan di bawah batas tersebut.\n\nGaris Kemiskinan terdiri dari:\n1. Garis Kemiskinan Makanan: kebutuhan 2.100 kkal per hari\n2. Garis Kemiskinan Non-Makanan: perumahan, pendidikan, kesehatan', '2026-02-27 21:58:49', '2026-02-27 21:58:49'),
(9, 7, 3, 'Inflasi BPS disajikan dalam 3 format:\n1. Month-to-Month (m-to-m): perubahan vs bulan lalu\n2. Year-on-Year (y-on-y): perubahan vs bulan yang sama tahun lalu (paling sering dikutip media)\n3. Calendar Year: kumulatif sejak Januari', '2026-03-01 21:58:49', '2026-03-01 21:58:49'),
(11, 9, 6, 'Angka absolut adalah nilai mentah contohnya 500.000 jiwa miskin. Angka relatif adalah perbandingan terhadap total contohnya 12,5 persen.\n\nGunakan absolut untuk mengetahui skala masalah. Gunakan relatif untuk membandingkan antar wilayah berbeda ukuran populasi.', '2026-03-05 21:58:49', '2026-03-05 21:58:49'),
(12, 10, 7, 'TPT Lampung beberapa tahun terakhir:\n- 2020: 4,67 persen (naik akibat pandemi)\n- 2021: 4,69 persen\n- 2022: 4,52 persen\n- 2023: 4,23 persen\n\nRata-rata TPT nasional sekitar 5,3 persen, jadi Lampung masih di bawah rata-rata nasional.', '2026-03-07 21:58:49', '2026-03-07 21:58:49'),
(13, 11, 2, 'IPM mengukur pembangunan manusia dari 3 dimensi:\n1. Umur Harapan Hidup\n2. Harapan Lama Sekolah dan Rata-rata Lama Sekolah\n3. Pengeluaran per Kapita\n\nNilai IPM antara 0-100. IPM Lampung 2023 sekitar 72 (kategori Tinggi). Nasional sekitar 74.', '2026-03-09 21:58:49', '2026-03-09 21:58:49'),
(14, 12, 8, 'Untuk akses data Sakernas:\n1. Kunjungi https://mikrodata.bps.go.id\n2. Daftar akun\n3. Cari Sakernas, pilih tahun\n4. Klik Ajukan Akses dan isi formulir\n\nProses approval 1-3 hari kerja. Format: SAV (SPSS) dan CSV.', '2026-03-11 21:58:49', '2026-03-11 21:58:49'),
(15, 14, 9, 'BPS punya fitur Tabel Dinamis di bps.go.id:\n1. Pilih menu Data, lalu Tabel Dinamis\n2. Pilih variabel yang ingin dibandingkan\n3. Centang beberapa provinsi sekaligus\n4. Export ke Excel\n\nBisa juga gunakan Satu Data Indonesia di data.go.id.', '2026-03-15 21:58:49', '2026-03-15 21:58:49'),
(16, 15, 4, 'NTP = (Indeks Harga Diterima Petani / Indeks Harga Dibayar Petani) x 100\n\nInterpretasi:\n- NTP > 100: petani surplus, daya beli meningkat\n- NTP = 100: impas\n- NTP < 100: petani defisit, biaya lebih tinggi dari pendapatan\n\nNTP Lampung biasanya 100-110, artinya petani masih surplus.', '2026-03-17 15:58:49', '2026-03-17 15:58:49');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `created_at`) VALUES
(1, 1, 'user', 'Berapa jumlah penduduk Lampung sekarang?', '2026-02-25 21:58:49'),
(2, 1, 'assistant', 'Berdasarkan Sensus Penduduk 2020, jumlah penduduk Provinsi Lampung adalah 9.007.848 jiwa. Untuk proyeksi terbaru cek di lampung.bps.go.id.', '2026-02-25 21:58:49'),
(3, 1, 'user', 'Kabupaten mana yang paling padat penduduknya?', '2026-02-25 21:58:49'),
(4, 1, 'assistant', 'Kota Bandar Lampung memiliki kepadatan tertinggi sekitar 4.600 jiwa per km2. Untuk jumlah terbanyak secara absolut, Lampung Tengah di posisi pertama.', '2026-02-25 21:58:49'),
(5, 2, 'user', 'Bagaimana cara download data BPS secara gratis?', '2026-03-07 21:58:49'),
(6, 2, 'assistant', 'Kunjungi bps.go.id, pilih menu Publikasi untuk PDF atau Tabel Statistik untuk Excel. Semua publikasi BPS tersedia gratis untuk publik.', '2026-03-07 21:58:49'),
(7, 3, 'user', 'Apa itu inflasi dan bagaimana BPS mengukurnya?', '2026-03-02 21:58:49'),
(8, 3, 'assistant', 'Inflasi adalah kenaikan harga barang dan jasa secara umum. BPS mengukurnya menggunakan Indeks Harga Konsumen dari survei harga di 90 kota setiap bulan.', '2026-03-02 21:58:49'),
(9, 4, 'user', 'Berapa persentase kemiskinan di Lampung?', '2026-03-09 21:58:49'),
(10, 4, 'assistant', 'Tingkat kemiskinan Lampung sekitar 11-12 persen, masih di atas rata-rata nasional 9 persen. BPS mengukurnya berdasarkan Garis Kemiskinan yang mencakup kebutuhan makanan dan non-makanan.', '2026-03-09 21:58:49'),
(11, 5, 'user', 'Sektor apa yang paling besar kontribusinya ke PDRB Lampung?', '2026-03-12 21:58:49'),
(12, 5, 'assistant', 'Kontributor terbesar PDRB Lampung: Pertanian sekitar 30 persen, Industri Pengolahan sekitar 18 persen, dan Perdagangan sekitar 13 persen.', '2026-03-12 21:58:49');

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `user_id`, `title`, `created_at`) VALUES
(1, 2, 'Pertanyaan tentang data penduduk Lampung', '2026-02-25 21:58:49'),
(2, 2, 'Cara download data BPS', '2026-03-07 21:58:49'),
(3, 3, 'Penjelasan tentang inflasi', '2026-03-02 21:58:49'),
(4, 4, 'Data kemiskinan Lampung', '2026-03-09 21:58:49'),
(5, 5, 'Tentang PDRB Lampung', '2026-03-12 21:58:49');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `is_read`, `created_at`, `ref_id`) VALUES
(1, 2, 'new_answer', 'admin menjawab pertanyaan Anda: Bagaimana cara membaca tabel statistik BPS', 1, '2026-02-16 21:58:49', 1),
(2, 2, 'new_answer', 'sari_dewi menjawab pertanyaan Anda: Bagaimana cara membaca tabel statistik BPS', 1, '2026-02-17 21:58:49', 1),
(3, 3, 'new_answer', 'budi_s menjawab pertanyaan Anda: Apa perbedaan Sensus Penduduk dan SUPAS', 1, '2026-02-18 21:58:49', 2),
(4, 4, 'new_answer', 'admin menjawab pertanyaan Anda: Berapa jumlah penduduk Provinsi Lampung', 1, '2026-02-21 21:58:49', 3),
(5, 4, 'new_answer', 'ahmad_f menjawab pertanyaan Anda: Berapa jumlah penduduk Provinsi Lampung', 0, '2026-02-22 21:58:49', 3),
(6, 5, 'new_answer', 'budi_s menjawab pertanyaan Anda: Apa yang dimaksud dengan PDRB', 0, '2026-02-23 21:58:49', 4),
(7, 6, 'new_answer', 'admin menjawab pertanyaan Anda: Bagaimana cara mengunduh data mikro dari BPS', 0, '2026-02-25 21:58:49', 5),
(8, 2, 'new_answer', 'maya_p menjawab pertanyaan Anda: Bagaimana tren angka pengangguran di Lampung', 0, '2026-03-07 21:58:49', 10);

-- --------------------------------------------------------

--
-- Table structure for table `pdf_files`
--

CREATE TABLE `pdf_files` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_hidden` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `judul`, `deskripsi`, `file_path`, `created_at`, `updated_at`, `is_hidden`) VALUES
(1, 2, 'Bagaimana cara membaca tabel statistik BPS Provinsi Lampung?', 'Saya baru pertama kali mengakses data dari website BPS Lampung. Ada banyak tabel dengan angka-angka yang saya kurang pahami. Apakah ada panduan cara membaca dan menginterpretasikan tabel statistik tersebut? Khususnya tabel yang berisi data penduduk per kabupaten.', NULL, '2026-02-15 21:58:49', '2026-02-15 21:58:49', 0),
(2, 3, 'Apa perbedaan antara Sensus Penduduk dan Survei Penduduk Antar Sensus (SUPAS)?', 'Saya sering mendengar dua istilah ini dalam konteks data kependudukan Indonesia. Bisa dijelaskan apa perbedaan mendasarnya? Kapan masing-masing dilaksanakan dan apa tujuan utamanya?', NULL, '2026-02-17 21:58:49', '2026-02-17 21:58:49', 0),
(3, 4, 'Berapa jumlah penduduk Provinsi Lampung berdasarkan data terbaru BPS?', 'Saya membutuhkan data jumlah penduduk Provinsi Lampung terbaru untuk keperluan penelitian skripsi. Mohon informasinya beserta sumber dan tahun datanya. Apakah bisa dirinci per kabupaten/kota?', NULL, '2026-02-20 21:58:49', '2026-02-20 21:58:49', 0),
(4, 5, 'Apa yang dimaksud dengan PDRB dan bagaimana cara menghitungnya?', 'Dalam laporan ekonomi daerah sering disebut istilah PDRB. Saya ingin memahami apa pengertiannya, apa bedanya dengan PDB nasional, dan bagaimana BPS menghitung angka ini?', NULL, '2026-02-22 21:58:49', '2026-02-22 21:58:49', 0),
(5, 6, 'Bagaimana cara mengunduh data mikro dari website BPS?', 'Saya perlu data mikro untuk keperluan analisis statistik lanjutan. Apakah BPS menyediakan data mikro yang bisa diunduh publik? Bagaimana prosedur mendapatkannya dan apa saja formatnya?', NULL, '2026-02-24 21:58:49', '2026-02-24 21:58:49', 0),
(6, 7, 'Apa indikator yang digunakan BPS untuk mengukur tingkat kemiskinan?', 'Saya membaca berita tentang penurunan angka kemiskinan di Lampung. Indikator apa saja yang BPS gunakan untuk mengukur kemiskinan? Apakah hanya berdasarkan pendapatan saja atau ada faktor lain?', NULL, '2026-02-26 21:58:49', '2026-02-26 21:58:49', 0),
(7, 8, 'Bagaimana cara menginterpretasikan angka inflasi bulanan dari BPS?', 'BPS setiap bulan merilis data inflasi. Saya ingin memahami cara membaca rilis tersebut. Apa itu inflasi month to month, year on year, dan calendar year? Apa bedanya?', NULL, '2026-02-28 21:58:49', '2026-02-28 21:58:49', 0),
(8, 9, 'Apakah data BPS bisa digunakan untuk penelitian akademik?', 'Saya mahasiswa yang sedang mengerjakan tugas akhir. Apakah data yang dipublikasikan BPS boleh digunakan untuk penelitian akademik? Bagaimana cara mencantumkan sumbernya dalam daftar pustaka?', NULL, '2026-03-02 21:58:49', '2026-03-02 21:58:49', 0),
(9, 10, 'Apa perbedaan antara angka absolut dan relatif dalam laporan statistik?', 'Ketika membaca laporan BPS, kadang data disajikan dalam bentuk angka absolut seperti jumlah jiwa, kadang relatif seperti persentase. Kapan sebaiknya menggunakan masing-masing?', NULL, '2026-03-04 21:58:49', '2026-03-04 21:58:49', 0),
(10, 2, 'Bagaimana tren angka pengangguran di Lampung beberapa tahun terakhir?', 'Saya ingin mengetahui tren Tingkat Pengangguran Terbuka (TPT) di Provinsi Lampung dalam 5 tahun terakhir. Ada data yang tersedia dan bagaimana perbandingannya dengan rata-rata nasional?', NULL, '2026-03-06 21:58:49', '2026-03-06 21:58:49', 0),
(11, 3, 'Apa itu Indeks Pembangunan Manusia (IPM) dan komponen apa yang mempengaruhinya?', 'Saya sering melihat angka IPM dalam laporan pembangunan daerah. Ingin memahami: apa itu IPM, bagaimana cara menghitungnya, dan apa saja dimensi yang diukur menurut metodologi BPS?', NULL, '2026-03-08 21:58:49', '2026-03-08 21:58:49', 0),
(12, 4, 'Bagaimana cara akses data Sakernas (Survei Angkatan Kerja Nasional)?', 'Untuk penelitian ketenagakerjaan, saya membutuhkan data dari Sakernas. Bagaimana cara mengaksesnya? Apakah perlu registrasi khusus? Data tahun berapa saja yang tersedia?', NULL, '2026-03-10 21:58:49', '2026-03-10 21:58:49', 0),
(13, 5, 'Apa perbedaan antara data primer dan data sekunder dalam statistik?', 'Dalam metodologi penelitian sering disebut data primer dan sekunder. Dalam konteks statistik BPS, data mana yang termasuk primer dan mana yang sekunder?', NULL, '2026-03-12 21:58:49', '2026-03-12 21:58:49', 0),
(14, 6, 'Bagaimana cara membandingkan data statistik antar provinsi di Indonesia?', 'Saya ingin membandingkan berbagai indikator statistik Lampung dengan provinsi lain di Sumatera. Apakah ada platform dari BPS yang memudahkan perbandingan data antar provinsi?', NULL, '2026-03-14 21:58:49', '2026-03-14 21:58:49', 0),
(15, 7, 'Apa itu Nilai Tukar Petani (NTP) dan mengapa penting bagi sektor pertanian?', 'Lampung adalah provinsi agraris. Saya ingin memahami indikator NTP yang sering muncul dalam laporan BPS. Apa pengertiannya dan apa artinya bila NTP di bawah 100?', NULL, '2026-03-16 21:58:49', '2026-03-16 21:58:49', 0);

-- --------------------------------------------------------

--
-- Table structure for table `post_tags`
--

CREATE TABLE `post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_tags`
--

INSERT INTO `post_tags` (`post_id`, `tag_id`) VALUES
(1, 1),
(1, 11),
(2, 2),
(2, 3),
(3, 3),
(3, 10),
(4, 4),
(4, 14),
(5, 1),
(5, 11),
(6, 6),
(6, 10),
(7, 4),
(7, 5),
(8, 1),
(8, 13),
(9, 4),
(9, 12),
(10, 10),
(10, 15),
(11, 8),
(11, 12),
(12, 13),
(12, 15),
(13, 1),
(13, 13),
(14, 1),
(14, 10),
(15, 9),
(15, 10);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `target_type` enum('post','answer') NOT NULL,
  `target_id` int(11) NOT NULL,
  `isi_laporan` text NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `target_type`, `target_id`, `isi_laporan`, `created_at`) VALUES
(1, 9, 'post', 5, 'Pertanyaan ini sepertinya duplikat dari post lain.', '2026-02-27 21:58:49'),
(2, 10, 'post', 9, 'Pertanyaan kurang relevan dengan topik statistik BPS.', '2026-03-07 21:58:49');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`) VALUES
(11, 'data-bps'),
(4, 'ekonomi'),
(12, 'indeks'),
(5, 'inflasi'),
(6, 'kemiskinan'),
(8, 'kesehatan'),
(10, 'lampung'),
(14, 'pdrb'),
(7, 'pendidikan'),
(3, 'penduduk'),
(9, 'pertanian'),
(2, 'sensus'),
(1, 'statistik'),
(13, 'survei'),
(15, 'tenaga-kerja');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `username`, `email`, `jenis_kelamin`, `password_hash`, `role`, `google_id`, `created_at`, `is_active`, `avatar_url`) VALUES
(2, 'Budi Santoso', 'budi_s', 'budi@gmail.com', 'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-01-31 21:58:49', 1, NULL),
(3, 'Sari Dewi', 'sari_dewi', 'sari@gmail.com', 'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-02-05 21:58:49', 1, NULL),
(4, 'Ahmad Fauzi', 'ahmad_f', 'ahmad@yahoo.com', 'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-02-10 21:58:49', 1, NULL),
(5, 'Rina Marlina', 'rina_m', 'rina@gmail.com', 'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-02-15 21:58:49', 1, NULL),
(6, 'Deni Kurniawan', 'deni_k', 'deni@outlook.com', 'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-02-20 21:58:49', 1, NULL),
(7, 'Maya Putri', 'maya_p', 'maya@gmail.com', 'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-02-25 21:58:49', 1, NULL),
(8, 'Hendra Wijaya', 'hendra_w', 'hendra@gmail.com', 'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-03-02 21:58:49', 1, NULL),
(9, 'Lestari Ningrum', 'lestari_n', 'lestari@gmail.com', 'P', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-03-07 21:58:49', 1, NULL),
(10, 'Rizky Pratama', 'rizky_p', 'rizky@gmail.com', 'L', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGKFkNvxPjZKFw7H5kDjlE4rS9K', 'user', NULL, '2026-03-12 21:58:49', 1, NULL),
(11, 'Admin', 'admin', 'admin@bps.go.id', NULL, '$2b$12$sKI4RwjaNuINBSrRFKNNkeAz9t8T4e5buCsnz4PoQ7x1nHhN.3KM2', 'admin', NULL, '2026-03-18 17:32:42', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `target_type` enum('post','answer') NOT NULL,
  `target_id` int(11) NOT NULL,
  `value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `votes`
--

INSERT INTO `votes` (`id`, `user_id`, `target_type`, `target_id`, `value`) VALUES
(1, 3, 'post', 1, 1),
(2, 4, 'post', 1, 1),
(3, 5, 'post', 1, 1),
(4, 5, 'post', 2, 1),
(5, 6, 'post', 2, 1),
(6, 7, 'post', 3, 1),
(7, 8, 'post', 3, 1),
(8, 9, 'post', 3, 1),
(9, 3, 'post', 4, 1),
(10, 4, 'post', 4, 1),
(11, 4, 'post', 7, 1),
(12, 5, 'post', 7, 1),
(13, 6, 'post', 7, 1),
(14, 7, 'post', 11, 1),
(15, 8, 'post', 11, 1),
(16, 9, 'post', 15, 1),
(17, 10, 'post', 15, 1),
(18, 3, 'answer', 1, 1),
(19, 4, 'answer', 1, 1),
(20, 5, 'answer', 1, 1),
(21, 2, 'answer', 3, 1),
(22, 6, 'answer', 3, 1),
(23, 7, 'answer', 4, 1),
(24, 8, 'answer', 4, 1),
(25, 2, 'answer', 6, 1),
(26, 3, 'answer', 6, 1),
(27, 9, 'answer', 6, 1),
(28, 4, 'answer', 8, 1),
(29, 5, 'answer', 8, 1),
(30, 10, 'answer', 10, 1),
(31, 2, 'answer', 10, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alembic_version`
--
ALTER TABLE `alembic_version`
  ADD PRIMARY KEY (`version_num`);

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `pdf_files`
--
ALTER TABLE `pdf_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filename` (`filename`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_tags`
--
ALTER TABLE `post_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_vote` (`user_id`,`target_type`,`target_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `pdf_files`
--
ALTER TABLE `pdf_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pdf_files`
--
ALTER TABLE `pdf_files`
  ADD CONSTRAINT `pdf_files_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_tags`
--
ALTER TABLE `post_tags`
  ADD CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- PostgreSQL SQL Dump Conversion
-- Database: sharefood

-- Drop tables if exist (optional, for reset)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  profile_picture TEXT NOT NULL
);

-- DONATIONS table
CREATE TABLE donations (
  donation_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  expiry_date DATE,
  location TEXT NOT NULL,
  donation_status VARCHAR(20) CHECK (
    donation_status IN ('available', 'confirmed', 'completed', 'canceled')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  donation_picture TEXT,
  quantity_value NUMERIC(10,2) NOT NULL,
  quantity_unit VARCHAR(10) CHECK (
    quantity_unit IN ('kg', 'g', 'liter', 'ml', 'pcs', 'pack')
  ),
  category VARCHAR(50) CHECK (
    category IN (
      'vegetables',
      'fruits',
      'bakery',
      'dairy',
      'meat',
      'non-perishable',
      'prepared-food'
    )
  )
);


-- RATINGS table
CREATE TABLE ratings (
  rating_id SERIAL PRIMARY KEY,
  donation_id INTEGER NOT NULL REFERENCES donations(donation_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rate NUMERIC(2,1) NOT NULL CHECK (rate >= 1.0 AND rate <= 5.0),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REQUESTS table
CREATE TABLE requests (
  request_id SERIAL PRIMARY KEY,
  donation_id INTEGER NOT NULL REFERENCES donations(donation_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  requested_quantity VARCHAR(50),
  pickup_time TIME,
  note TEXT,
  request_status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (request_status IN ('waiting','approved','rejected','completed','canceled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,        
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,                        
  is_read BOOLEAN DEFAULT FALSE,
   is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- INSERT DATA

-- USERS
INSERT INTO users (user_id, user_name, email, password, user_type, phone, created_at, profile_picture) VALUES
(1, 'Bahiskara', 'bahiskara@gmail.com', '$2a$12$D5BGRx44IEWJ5rQvbn83ceJ4CG0j4yftF32vGgSVTRVGC51ASFMoa', 'donor', '081234567890', '2025-06-11 00:59:41', ''),
(2, 'Bima', 'bima@gmail.com', '$2b$10$4ovTJ0Y530k9AfuxoXyaTOtL3s.OdcdoRGwyPxbBdJemy5slO7sY2', 'donor', '081234567890', '2025-06-11 03:02:48', ''),
(6, 'Indra', 'ikoindra@gmail.com', '$2b$10$UPwydlExWPWcjd3b185XP.teUSWbIw4PwPHT/99es08qGqsnIDJPq', 'donor', '081234672384', '2025-06-11 03:37:54', 'https://ik.imagekit.io/choandrew/boy-anime-drawing-illustration_525160-1161_M6huDQjJD.jpg'),
(7, 'Arya', 'arya@gmail.com', '$2b$10$6xrpqgc6f8pJ7/uJX/eYGevqUwKv02NH/7JJz5UEzc/mr1ShVUHyG', 'donor', '081237438457', '2025-06-11 23:27:48', 'https://ik.imagekit.io/choandrew/boy-anime-drawing-illustration_525160-1161_VJFAFyb-Z.jpg');

-- DONATIONS
INSERT INTO donations (donation_id, user_id, title, description, expiry_date, location, donation_status, created_at, donation_picture, quantity_value, quantity_unit) VALUES
(1, 1, 'Canned Tuna - 5 cans', '5 unopened cans of tuna in good condition. Best before July 2025.', '2025-07-01', 'Jl. Merdeka No. 123, Jakarta', 'available', '2025-06-11 05:39:42', NULL, 0.00, 'kg'),
(2, 1, 'Roti dan makanan ringan', 'Beberapa roti dan makanan ringan yang seminggu lagi mendekati tanggal kadaluarsa. Masih sangat layak untuk di makan', NULL, 'BNI ATM UPN "Veteran" Jawa Timur', 'available', '2025-06-11 06:15:49', NULL, 0.00, 'kg'),
(3, 1, 'Mie Instan', 'Kadaluarsa dalam 1 bulan', NULL, 'ATM UPN Veteran Jawa Timur', 'completed', '2025-06-11 06:20:14', 'https://ik.imagekit.io/choandrew/satoru-gojo-from-jujutsu-kaisen_3840x2160_xtrafondos.com_VISZwuDuF.jpg', 0.00, 'kg'),
(6, 1, 'Beras', 'Beras masih bisa dikonsumsi dalam jangka waktu panjang', '2025-07-07', 'Indomaret Medokan Ayu', 'available', '2025-06-11 06:34:51', 'https://ik.imagekit.io/choandrew/satoru-gojo-from-jujutsu-kaisen_3840x2160_xtrafondos.com_L5MxSHOIk.jpg', 0.00, 'kg'),
(7, 7, 'Beras', 'Beras lebihan panen', '2025-09-10', 'Jl. Mojopahit, Wunut, Sidoarjo (Rumah Pagar Putih)', 'completed', '2025-06-11 23:35:39', 'https://ik.imagekit.io/choandrew/itachi-uchiha-red-crows-dark-atmosphere-desktop-wallpaper_zDowRhUeo.jpg', 0.00, 'kg');

-- RATINGS
INSERT INTO ratings (rating_id, donation_id, user_id, rate, review, created_at) VALUES
(1, 1, 2, 4.5, 'Very generous, the food was fresh and well-packed.', '2025-06-11 22:13:07'),
(2, 3, 1, 4.5, 'Very helpful.', '2025-06-11 22:39:44'),
(4, 7, 7, 5.0, 'very helpful', '2025-06-11 23:52:54');

-- REQUESTS
INSERT INTO requests (request_id, donation_id, user_id, requested_quantity, pickup_time, note, request_status, created_at) VALUES
(1, 1, 2, '2 pcs', '10:00:00', 'I might arrive 15 minutes late.', 'waiting', '2025-06-11 08:33:14'),
(7, 3, 1, '2 pack', '15:00:00', '-', 'approved', '2025-06-11 14:37:35'),
(8, 7, 7, '3 kg', '18:00:00', 'Saya ambil sore sekitar maghrib', 'waiting', '2025-06-11 23:40:14'),
(9, 7, 7, '3 kg', '18:00:00', 'Saya ambil sore sekitar maghrib', 'completed', '2025-06-11 23:40:16');

-- NOTIFICATIONS
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  1,
  'rating',
  'You received a new rating',
  'You received a 5-star rating from Alice Smith',
  '{"rating_id": 1}'
);

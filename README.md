# 🌿 OxyPlant

OxyPlant adalah platform manajemen tanaman yang membantu pengguna merawat tanaman dengan lebih terstruktur, terhubung dengan komunitas, dan mendapatkan informasi lengkap seputar perawatan tanaman.

## 🚀 Fitur Unggulan

### 🌱 Garden Manager
Mencatat dan mengatur jadwal perawatan tanaman seperti penyiraman, pemupukan, dan pencahayaan.

### 🌿 Plant Care
Menyediakan panduan perawatan tanaman secara detail dan mudah dipahami.

### 📖 Plant Info
Menampilkan informasi lengkap tentang berbagai jenis tanaman, termasuk kebutuhan tumbuhnya.

### 👥 Community
Halaman yang menampilkan aktivitas tanaman pengguna lain seperti penyiraman dan panen. Pengguna bisa saling terinspirasi dan terhubung melalui informasi tanaman dan statusnya.

### ℹ️ About
Halaman yang menjelaskan tujuan, manfaat, serta gambaran umum tentang platform OxyPlant dan fitur-fitur utamanya.

---

## Link Deployment

```bash
https://oxyplant-production.up.railway.app/
```

## How To Install

### 1. Clone the repository

```bash
git clone https://github.com/Iffatunnisaa/OxyPlant-AI-Detection.git
```

### 2. Go to folder and install dependencies

```bash
npm install
```

### 3. Copy the environment file

```bash
cp .env.example .env
```

> Jika error di Windows, jalankan:

```bash
copy .env.example .env
```

### 4. Generate application encryption key

```bash
node ace generate:key
```

### 5. Edit `.env` file

Ubah konfigurasi berikut:

```env
APP_KEY=hasil_dari_generate:key
JWT_SECRET=secret_key_kamu
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/adonis_mongo_auth
FASTAPI_AI_URL=http://localhost:8000
```

✅ **Pastikan:**

- Username/password benar  
- IP Address sudah di-whitelist di MongoDB Atlas  
- Database `adonis_mongo_auth` sudah dibuat (akan otomatis saat data diinsert)  

### 6. Build the project

```bash
node ace build
```

### 7. Seed data awal MongoDB

```bash
node ace mongo:seeder
```

### 8. Run the application

```bash
node build/server.js
```

### 9. Open your browser

```
http://localhost:3333
```

---

## Features

- ✅ Register/Login dengan autentikasi JWT
- 🌱 Manajemen tanaman
- 👥 Komunitas antar pengguna
- 💾 Disimpan di MongoDB menggunakan Mongoose
- 🧠 Deteksi penyakit tanaman lewat service FastAPI terpisah

## ML Service

Folder `ml-service/` berisi backend Python terpisah untuk prediksi penyakit tanaman. Service ini tetap berada di dalam repository yang sama, tetapi dijalankan sebagai proses sendiri agar model AI tidak bercampur dengan aplikasi utama AdonisJS.

### Endpoint utama

- `GET /health` untuk cek status service
- `POST /predict-image/` untuk upload gambar dan mendapatkan hasil prediksi

### Cara menjalankan

1. Masuk ke folder `ml-service`
2. Buat virtual environment Python
3. Install dependency dari `requirements.txt`
4. Salin `.env.example` menjadi `.env` dan sesuaikan `MODEL_PATH`
5. Jalankan `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`

### Kontrak response

Endpoint `POST /predict-image/` mengembalikan data dengan field seperti `plant`, `disease`, `confidence`, `valid`, dan `top_3_predictions`.

Integrasi backend Adonis ke ML service tersedia pada route internal:

- `POST /admin/garden_manager/detect`

## Tech Stack

- ⚙️ AdonisJS
- 🛢️ MongoDB + Mongoose
- 🔐 JWT (JSON Web Token)
- 🧠 TypeScript
- 🧩 Edge Templating Engine
- 🐍 FastAPI untuk ML service

## License

MIT © 2025 - OxyPlant Team

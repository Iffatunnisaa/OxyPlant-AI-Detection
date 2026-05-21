# ML Service

Service ini memisahkan proses prediksi penyakit tanaman dari aplikasi utama AdonisJS. Service menerima gambar daun, menjalankan model `.keras`, lalu mengembalikan hasil prediksi ke frontend.

## Struktur

- `backend/main.py` - entrypoint FastAPI
- `backend/model_loader.py` - loader model dan metadata
- `backend/preprocessing.py` - preprocessing gambar
- `backend/inference.py` - inference + validasi hasil
- `backend/config.py` - konfigurasi path dan parameter
- `model/` - artefak model dan tokenizer

## Environment

Salin file `.env.example` ke `.env` lalu isi nilai berikut:

- `MODEL_PATH` - lokasi file model `.keras`
- `class_names.json` - opsional, label kelas urutan training. Jika tidak ada, service fallback dari `plant_disease_mapping.json`
- `SCALER_PATH` - lokasi file scaler
- `TARGET_ENCODER_PATH` - lokasi file target encoder
- `TOKENIZER_DIR` - lokasi folder tokenizer
- `IMAGE_SIZE` - ukuran input model, misalnya `224,224`
- `ALLOWED_ORIGINS` - origin frontend yang diizinkan

## Run

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## API

### GET /health

Menampilkan status service.

### POST /predict-image/

Form-data:

- `file`: gambar tanaman

Response utama:

- `filename`
- `plant`
- `disease`
- `confidence`
- `valid`
- `plant_candidates`
- `multitask_source`
- `possible_diseases`
- `top_3_predictions`
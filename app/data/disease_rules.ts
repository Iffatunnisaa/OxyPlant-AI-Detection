export const diseaseRules: Record<string, Record<string, any>> = {
  jagung: {
    'cercospora leaf spot gray': {
      severity: 'high',
      prevention: [
        'Gunakan benih atau varietas jagung yang tahan penyakit',
        'Jangan menanam jagung terus-menerus di lahan yang sama',
        'Atur jarak tanam agar sirkulasi udara baik',
      ],
      treatment: [
        'Semprot fungisida seperti strobilurin atau triazole  saat bercak mulai terlihat',
        'Buang daun yang sudah parah terinfeksi',
        'Bersihkan sisa tanaman setelah panen',
      ],
      monitoring: [
        'Periksa daun bagian bawah setiap minggu',
        'Waspadai saat cuaca lembab atau sering hujan',
        'Pantau apakah bercak semakin meluas',
      ],
      references: ['Nsibo et al. (2024)'],
    },
    'common rust': {
      severity: 'medium',
      prevention: [
        'Gunakan varietas jagung tahan penyakit',
        'Hindari tanaman terlalu rapat',
        'Kurangi kelembaban berlebih pada lahan',
        'Jangan memberi pupuk nitrogen berlebihan',
      ],
      treatment: [
        'Aplikasikan fungisida berbahan aktif Mancozeb sesuai anjuran',
        'Buang daun yang terinfeksi berat',
        'Lakukan rotasi tanaman',
      ],
      monitoring: [
        'Cek adanya bintik coklat pada daun',
        'Periksa peningkatan kelembaban setelah hujan',
        'Periksa perkembangan bercak setiap minggu',
      ],
      references: ['Mohammed et al. (2023)'],
    },
    'northern leaf blight': {
      severity: 'high',
      prevention: [
        'Gunakan varietas tahan Exserohilum turcicum',
        'Bersihkan sisa tanaman setelah panen ',
        'Gunakan jarak tanam optimal',
      ],
      treatment: [
        'Aplikasikan fungisida triazole/strobilurin pada infeksi awal',
        'Musnahkan residu tanaman sakit',
        'Pengelolaan irigasi agar daun tidak terlalu lembab',
      ],
      monitoring: [
        'Pantau perkembangan lesi memanjang pada daun',
        'Monitor kelembaban dan curah hujan',
        'Cek penyebaran bercak secara rutin',
      ],
      references: ['Mohammed et al. (2023)'],
    },
  },

  tomat: {
    'bacterial leaf spot': {
      severity: 'high',
      prevention: [
        'Gunakan benih bebas patogen',
        'Hindari penyiraman langsung ke daun',
        'Lakukan sanitasi alat pertanian',
      ],
      treatment: [
        'Gunakan bakterisida berbahan copper',
        'Buang daun yang terinfeksi',
        'Lakukan rotasi tanaman',
      ],
      monitoring: [
        'Pantau munculnya bercak hitam kecil',
        'Periksa penyebaran setelah hujan',
        'Cek tanaman secara rutin',
      ],
      references: ['Osdaghi et al. (2021)'],
    },
    'early blight': {
      severity: 'medium',
      prevention: [
        'Gunakan mulsa untuk mengurangi percikan tanah',
        'Lakukan rotasi tanaman',
        'Pastikan sirkulasi udara baik',
      ],
      treatment: [
        'Gunakan fungisida berbahan chlorothalonil atau mancozeb', 
        'Buang daun yang terinfeksi',
        'Bersihkan sisa tanaman sakit',
      ],
      monitoring: [
        'Pantau bercak coklat melingkar pada daun bawah', 
        'Periksa perkembangan setelah kelembaban tinggi',
        'Amati perkembangan bercak',
      ],
      references: ['Maurya et al. (2022)'],
    },
    'late blight': {
      severity: 'critical',
      prevention: [
        'Hindari kelembaban tinggi',
        'Gunakan varietas tahan penyakit',
        'Atur jarak tanam',
      ],
      treatment: [
        'Gunakan fungisida sistemik sesegera mungkin',
        'Isolasi tanaman yang terinfeksi berat',
      ],
      monitoring: [
        'Pantau bercak gelap yang cepat menyebar',
        'Monitor kondisi cuaca lembab',
      ],
      references: ['Maurya et al. (2022)'],
    },
    'leaf mold': {
      severity: 'medium',
      prevention: ['Kurangi kelembaban greenhouse', 'Tingkatkan ventilasi udara', 'Gunakan benih sehat'],
      treatment: ['Gunakan fungisida sesuai rekomendasi', 'Pangkas daun yang terinfeksi', 'Bersihkan area tanam'],
      monitoring: ['Pantau lapisan jamur di bawah daun', 'Periksa kelembaban udara', 'Cek penyebab jamur'],
      references: ['Zhao et al. (2022)'],
    },
    'mosaic virus': {
      severity: 'high',
      prevention: ['Gunakan benih sehat', 'Lakukan sanitasi alat', 'Hindari kontak tanaman sakit ke sehat'],
      treatment: ['Cabut tanaman yang terinfeksi berat', 'Kendalikan serangga pembawa virus', 'Disinfeksi alat'],
      monitoring: ['Pantau perubahan pola warna mosaik daun', 'Periksa penyebaran antar tanaman', 'Pantau tanaman muda secara rutin'],
      references: ['Hanssen et al. (2020)'],
    },
    'septoria spot': {
      severity: 'medium',
      prevention: ['Gunakan mulsa', 'Lakukan rotasi tanaman', 'Kurangi kelembaban daun'],
      treatment: ['Gunakan fungisida preventif', 'Buang daun bagian bawah yang terinfeksi', 'Bersihkan sisa tanaman'],
      monitoring: ['Pantau bercak kecil abu-abu pada daun bawah', 'Periksa kondisi lahan setelah hujan'],
      references: ['Pandey et al. (2024)'],
    },
    'yellow leaf curl': {
      severity: 'critical',
      prevention: ['Kontrol populasi whitefly (kutu kebul)', 'Bersihkan gulma di sekitar lahan', 'Gunakan varietas tahan virus'],
      treatment: ['Cabut tanaman yang terinfeksi berat', 'Bersihkan gulma sekitar lahan', 'Gunakan perangkap atau insektisida untuk kutu kebul'],
      monitoring: ['Pantau daun menguning dan menggulung', 'Periksa populasi whitefly', 'Monitoring rutin sejak awal tanam'],
      references: ['Yan et al. (2021)'],
    },
  },

  padi: {
    'bacterial leaf blight': {
      severity: 'high',
      prevention: ['Gunakan varietas tahan', 'Hindari pemupukan nitrogen berlebih', 'Gunakan benih sehat'],
      treatment: ['Gunakan agen hayati', 'Kurangi penyebaran air antar petak'],
      monitoring: ['Pantau gejala hawar dari ujung daun', 'Periksa penyebaran setelah hujan'],
      references: ['Teja et al. (2025)'],
    },
    'brown spot': {
      severity: 'medium',
      prevention: ['Gunakan pemupukan seimbang', 'Gunakan benih sehat'],
      treatment: ['Gunakan fungisida bila diperlukan'],
      monitoring: ['Pantau bercak coklat oval pada daun'],
      references: ['Sharma et al. (2021)'],
    },
    'leaf blast': {
      severity: 'critical',
      prevention: ['Gunakan varietas tahan blast', 'Kurangi nitrogen berlebih'],
      treatment: ['Gunakan fungisida tricyclazole'],
      monitoring: ['Pantau bercak berbentuk belah ketupat'],
      references: ['Deng et al. (2020)'],
    },
  },

  cabai: {
    'bacterial leaf spot': {
      severity: 'high',
      prevention: [
        'Gunakan benih bebas patogen',
        'Hindari penyiraman langsung ke daun',
        'Lakukan sanitasi alat pertanian',
      ],
      treatment: [
        'Gunakan bakterisida berbahan copper',
        'Buang daun yang terinfeksi',
        'Gunakan agen hayati bila tersedia',
      ],
      monitoring: [
        'Pantau munculnya bercak hitam kecil',
        'Periksa penyebaran setelah hujan atau kelembapan tinggi',
      ],
      references: ['Utami et al. (2022)'],
    },
    'yellow leaf curl': {
      severity: 'critical',
      prevention: [
        'Kontrol populasi whitefly (kutu kebul)',
        'Bersihkan gulma di sekitar lahan',
        'Gunakan varietas tahan virus',
      ],
      treatment: [
        'Cabut tanaman yang terinfeksi berat',
        'Gunakan perangkap atau insektisida untuk kutu kebul',
        'Pisahkan tanaman sakit dari tanaman sehat',
      ],
      monitoring: [
        'Pantau daun menguning dan menggulung',
        'Periksa populasi kutu kebul di sekita tanaman',
        'Lakukan pengecekan rutin sejak awal tanam',
      ],
      references: ['Nalla et al. (2023)'],
    },
  },

  kentang: {
    'early blight': {
      severity: 'medium',
      prevention: [
        'Gunakan mulsa untuk mengurangi percikan tanah',
        'Lakukan rotasi tanaman',
        'Jaga tanaman tetap sehat dengan nutrisi cukup',
      ],
      treatment: [
        'Gunakan fungisida berbahan chlorothalonil atau mancozeb',
        'Buang daun yang terinfeksi',
        'Bersihkan sisa tanaman yang sakit',
      ],
      monitoring: [
        'Pantau bercak coklat melingkar pada daun bawah',
        'Periksa perkembangan setelah kelembaban tinggi',
        'Amati apakah bercak bertambah besar',
      ],
      references: ['Schmey et al. (2024)'],
    },
    'late blight': {
      severity: 'critical',
      prevention: [
        'Hindari kelembaban tinggi',
        'Gunakan varietas tahan penyakit',
        'Atur jarak tanam dan pastikan drainase lahan baik',
      ],
      treatment: [
        'Gunakan fungisida sistemik sesegera mungkin',
        'Isolasi tanaman yang terinfeksi berat',
        'Bersihkan sisa tanaman sakit',
      ],
      monitoring: [
        'Pantau bercak gelap yang cepat menyebar',
        'Monitor kondisi cuaca lembab dan dingin',
        'Cek penyebaran penyakit setiap hari saat musim hujan',
      ],
      references: ['Maurya et al. (2025)'],
    },
  },
}

export default diseaseRules

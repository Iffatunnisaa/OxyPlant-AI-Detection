/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import GardenManagersController from '#controllers/garden_managers_controller'
import CommunityPostsController from '#controllers/community_posts_controller'
import ProfilesController from '#controllers/profiles_controller'
import PlantInfoAdminController from '#controllers/Admin/plant_info_admin_controller'
import PlantInfo from '#models/plant_info'
import RecommendationController from '#controllers/recommendation_controller'

const AuthController = () => import('#controllers/auth_controller')

// Public Routes
router.get('/', async ({ view }) => {
  return view.render('pages/home', { routeName: 'home' })
}).as('home')

router.get('/about', async ({ view }) => {
  return view.render('pages/about')
}).as('about')

const plantInfoCrops = [
  {
    id: 'padi',
    name: 'Padi',
    shortName: 'Pd',
    category: 'Tanaman pangan',
    description:
      'Padi adalah sumber pangan utama yang membutuhkan air stabil dan perhatian pada daun serta batang sejak awal pertumbuhan.',
    care: [
      { label: 'Penyiraman', value: 'Jaga air dangkal saat fase awal, lalu sesuaikan dengan umur tanaman.' },
      { label: 'Sinar matahari', value: 'Butuh cahaya penuh agar anakan tumbuh kuat.' },
      { label: 'Tanah', value: 'Cocok di lahan sawah yang subur dan kaya bahan organik.' },
    ],
    diseases: [
      { name: 'leaf blast', gejala: 'Bercak berbentuk lonjong berwarna abu-abu pada daun, bisa menyebar cepat.' },
      { name: 'bacterial leaf blight', gejala: 'Ujung daun menguning lalu mengering dari tepi ke tengah.' },
      { name: 'brown spot', gejala: 'Muncul bintik cokelat kecil pada daun yang lama-lama melebar.' },
    ],
    image: '/resources/img/padi.jpg',
  },
  {
    id: 'jagung',
    name: 'Jagung',
    shortName: 'Jg',
    category: 'Tanaman pangan',
    description:
      'Jagung cocok untuk lahan terbuka dan menjadi tanaman yang mudah dipahami pengguna karena tanda pertumbuhannya terlihat jelas.',
    care: [
      { label: 'Penyiraman', value: 'Siram secukupnya agar tanah lembap, bukan becek.' },
      { label: 'Sinar matahari', value: 'Butuh matahari penuh hampir sepanjang hari.' },
      { label: 'Tanah', value: 'Tumbuh baik di tanah gembur dengan drainase lancar.' },
    ],
    diseases: [
      { name: 'common rust', gejala: 'Bintik cokelat kemerahan tersebar di permukaan daun.' },
      { name: 'cercospora leaf spot gray', gejala: 'Bercak abu-abu memanjang pada daun.' },
      { name: 'northern leaf bight', gejala: 'Bercak besar memanjang berwarna cokelat keabu-abuan.' },    ],
    image: '/resources/img/jagung.jpeg',
  },
  {
    id: 'kentang',
    name: 'Kentang',
    shortName: 'Kt',
    category: 'Tanaman umbi',
    description:
      'Kentang cocok untuk daerah yang lebih sejuk dan perlu perhatian pada kelembapan tanah agar umbi berkembang baik.',
    care: [
      { label: 'Penyiraman', value: 'Pertahankan kelembapan tanah tanpa membuatnya tergenang.' },
      { label: 'Sinar matahari', value: 'Suka cahaya cukup, tetapi tidak terlalu panas.' },
      { label: 'Tanah', value: 'Gunakan media gembur agar umbi mudah terbentuk.' },
    ],
    diseases: [
      { name: 'early blight', gejala: 'Bercak cokelat dengan pola lingkaran konsentris pada daun.' },
      { name: 'late blight', gejala: 'Daun menghitam dan cepat membusuk terutama saat lembap.' },    ],
    image: '/resources/img/kentang.jpeg',
  },
  {
    id: 'cabai',
    name: 'Cabai',
    shortName: 'Cb',
    category: 'Tanaman hortikultura',
    description:
      'Cabai sangat populer dan sensitif terhadap serangan penyakit buah, sehingga cocok dijadikan contoh utama untuk AI detection.',
    care: [
      { label: 'Penyiraman', value: 'Siram teratur, terutama saat cuaca panas, tanpa membuat genangan.' },
      { label: 'Sinar matahari', value: 'Perlu cahaya penuh untuk membantu pembungaan.' },
      { label: 'Tanah', value: 'Tanah subur dan ringan akan membuat akar lebih sehat.' },
    ],
    diseases: [
      { name: 'bacterial leaf spot', gejala: 'Bercak kecil basah pada daun yang berubah menjadi cokelat.' },
      { name: 'yellow leaf curl', gejala: 'Daun menguning dan melengkung ke atas.' },    ],
    image: '/resources/img/rawit.jpeg',
  },
  {
    id: 'tomat',
    name: 'Tomat',
    shortName: 'Tm',
    category: 'Tanaman hortikultura',
    description:
      'Tomat mudah dikenali dan sangat cocok untuk mempelajari perbedaan antara tanaman sehat dan yang mulai terinfeksi.',
    care: [
      { label: 'Penyiraman', value: 'Jaga penyiraman stabil agar buah tidak pecah.' },
      { label: 'Sinar matahari', value: 'Butuh cahaya penuh supaya buah matang merata.' },
      { label: 'Tanah', value: 'Media subur dan berdrainase baik akan membantu hasil panen.' },
    ],
    diseases: [
      { name: 'bacterial leaf spot', gejala: 'Bercak kecil gelap pada daun yang meluas.' },
      { name: 'early blight', gejala: 'Bercak cokelat dengan pola melingkar.' },
      { name: 'late blight', gejala: 'Daun dan batang cepat menghitam dan membusuk.' },
      { name: 'leaf mold', gejala: 'Lapisan jamur keabu-abuan di bawah daun.' },
      { name: 'mosaic virus', gejala: 'Daun belang hijau muda dan tua seperti mozaik.' },
      { name: 'septoria spot', gejala: 'Bercak kecil dengan pusat terang dan tepi gelap.' },
      { name: 'yellow leaf curl', gejala: 'Daun menguning dan melengkung ke atas.' },    ],
    image: '/resources/img/tomat_ceri.jpeg',
  },
]

const plantInfoStats = {
  plantCount: plantInfoCrops.length,
  diseaseCount: plantInfoCrops.reduce((total, crop) => total + crop.diseases.length, 0),
  aiText: 'Pemindaian daun berbasis AI membantu membandingkan gejala dengan lebih cepat.',
}

router.group(() => {
  router.get('/', async ({ view }) => {
    try {
      const crops = await PlantInfo.find().sort({ createdAt: -1 })
      const stats = {
        plantCount: crops.length,
        diseaseCount: crops.reduce((total, crop) => total + crop.diseases.length, 0),
        aiText: 'Pemindaian daun berbasis AI membantu membandingkan gejala dengan lebih cepat.',
      }
      return view.render('pages/plant_info/index', {
        crops,
        stats,
      })
    } catch (error) {
      // Fallback to hardcoded data if database fails
      return view.render('pages/plant_info/index', {
        crops: plantInfoCrops,
        stats: plantInfoStats,
      })
    }
  }).as('index')
}).prefix('/plant_info').as('plant_info')

router.group(() => {
  router.get('/', [CommunityPostsController, 'index']).as('index')
  router.get('/:id', [CommunityPostsController, 'show']).as('show')
  router.post('/publish', [CommunityPostsController, 'publish']).as('publish').use(middleware.auth())
  router.post('/:id/comments', [CommunityPostsController, 'comment']).as('comments.store').use(middleware.auth())
  router.get('/:id/comments', [CommunityPostsController, 'comments']).as('comments.index')
}).prefix('/community').as('community').use(middleware.auth())

// Authentication Routes
router.group(() => {
  router.get('/register', async ({ view }) => {
    return view.render('auth/register')
  }).as('register')

  router.get('/login', async ({ view }) => {
    return view.render('auth/login')
  }).as('login')

  router.post('/register', [AuthController, 'register']).as('register.post')
  router.post('/login', [AuthController, 'login']).as('login.post')
}).use(middleware.guest()).as('auth')

router.get('/logout', [AuthController, 'logout']).as('auth.logout')

// Recommendation (DSS) endpoint
router.get('/recommendation', [RecommendationController, 'index']).as('recommendation')

router.get('/profil', [ProfilesController, 'index'])
  .as('profile')
  .use(middleware.auth())

router.post('/profil', [ProfilesController, 'update'])
  .as('profile.update')
  .use(middleware.auth())

router.get('/admin', async ({ view }) => {
  return view.render('admin/admin_manager')
})
  .as('admin.dashboard')
  .use([middleware.auth(), middleware.admin()])

router.group(() => {
  router.get('/', [GardenManagersController, 'index']).as('index')
  router.get('/add', [GardenManagersController, 'add']).as('add')
  router.get('/harvest', [GardenManagersController, 'harvest']).as('harvest')

  router.post('/add', [GardenManagersController, 'store']).as('store')
  router.post('/action', [GardenManagersController, 'action']).as('action')
  router.post('/community', [GardenManagersController, 'community']).as('community')
  router.post('/detect', [GardenManagersController, 'detect']).as('detect')
})
.prefix('/garden_manager')
.as('garden_manager')
.use(middleware.auth()) // 🔥 tetap butuh login

// Admin Routes - Plant Info Management
router.group(() => {
  router.get('/', [PlantInfoAdminController, 'index']).as('index')
  router.get('/create', [PlantInfoAdminController, 'create']).as('create')
  router.post('/', [PlantInfoAdminController, 'store']).as('store')
  router.get('/:id/edit', [PlantInfoAdminController, 'edit']).as('edit')
  router.put('/:id', [PlantInfoAdminController, 'update']).as('update')
  router.delete('/:id', [PlantInfoAdminController, 'destroy']).as('destroy')
})
.prefix('/admin/plant-info')
.as('admin.plant_info')
.use([middleware.auth(), middleware.admin()])

router.group(() => {
  router.get('/', [PlantInfoAdminController, 'index']).as('index')
  router.get('/create', [PlantInfoAdminController, 'create']).as('create')
  router.post('/', [PlantInfoAdminController, 'store']).as('store')
  router.get('/:id/edit', [PlantInfoAdminController, 'edit']).as('edit')
  router.put('/:id', [PlantInfoAdminController, 'update']).as('update')
  router.delete('/:id', [PlantInfoAdminController, 'destroy']).as('destroy')
})
.prefix('/admin/plant_info')
.as('admin.plant_info_legacy')
.use([middleware.auth(), middleware.admin()])

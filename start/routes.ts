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
import GardenManagersController from '#controllers/Admin/garden_managers_controller'
import CommunityPostsController from '#controllers/community_posts_controller'
import ProfilesController from '#controllers/Admin/profiles_controller'

const AuthController = () => import('#controllers/auth_controller')

// Public Routes
router.get('/', async ({ view }) => {
  return view.render('pages/home', { routeName: 'home' })
}).as('home')

router.get('/about', async ({ view }) => {
  return view.render('pages/about')
}).as('about')

router.group(() => {
  router.get('/', async ({ view }) => {
    return view.render('pages/plant_care/index')
  }).as('index')

  router.get('/detail', async ({ view }) => {
    return view.render('pages/plant_care/detail')
  }).as('detail')
}).prefix('/plant_care').as('plant_care')

router.group(() => {
  router.get('/', async ({ view }) => {
    return view.render('pages/plant_info/index')
  }).as('index')
}).prefix('/plant_info').as('plant_info')

router.group(() => {
  router.get('/', [CommunityPostsController, 'index']).as('index')
}).prefix('/community').as('community')



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



// Admin Routes
router.group(() => {
  router.get('/', async ({ view }) => {
    return view.render('admin/dashboard')
  }).as('index')

  router.get('/profile', [ProfilesController, 'index']).as('profile')

  router.group(() => {
    router.get('/', [GardenManagersController, 'index']).as('index')
    router.get('/add', [GardenManagersController, 'add']).as('add')
    router.get('/growth', [GardenManagersController, 'growth']).as('growth')
    router.get('/harvest', [GardenManagersController, 'harvest']).as('harvest')
    router.get('/pest', [GardenManagersController, 'pest']).as('pest')

    router.post('/add', [GardenManagersController, 'store']).as('store')
    router.post('/community', [GardenManagersController, 'community']).as('community')
  }).prefix('/garden_manager').as('garden_manager')
}).use(middleware.auth()).prefix('/admin').as('admin')

import type { HttpContext } from '@adonisjs/core/http'
import Plant from '#models/plant'
import CommunityPost from '#models/community_post'
import { cuid } from '@adonisjs/core/helpers'
import Application from '@adonisjs/core/services/app'

export default class GardenManagersController {
  async index({ request, response, view }: HttpContext) {
    try {     
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plants = await Plant.find({ user_id: request['user'].id })
      

      return view.render('admin/garden_manager/index', {
        plants,
      })
    } catch (err) {
      console.error('JWT Error:', err)
      return response.unauthorized({ message: 'Invalid or expired token.' })
    }
  }

  async add({ view }: HttpContext) {
    return view.render('admin/garden_manager/add')
  }

  async store({ request, response }: HttpContext) {
    const {
      name,
      type,
      plant_date,
      watering_schedule,
      notes,
    } = request.only(['name', 'type', 'plant_date', 'watering_schedule', 'notes'])

    const photo = request.file('photo_path', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png'],
    })

    const fileName = `${cuid()}.${photo?.extname}`

    await photo?.move(Application.publicPath('uploads'), {
      name: fileName,
      overwrite: true,
    })

    const file_path = `/uploads/${fileName}`

    try {
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plant = new Plant({
        user_id: request['user'].id,
        name,
        type,
        plant_date,
        watering_schedule,
        photo_path: file_path,
        notes,
      })

      await plant.save()

      return response.redirect().toRoute('admin.garden_manager.index')
    } catch (err) {
      console.error('JWT Error:', err)
      return response.unauthorized({ message: 'Invalid or expired token.' })
    }
  }

  async community({ request, response }: HttpContext) {
    const {
      plant_id,
      is_public,
      status,
      message,
    } = request.only(['plant_id', 'is_public', 'status', 'message'])

    try {
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plant = await Plant.findById(plant_id)

      if (!plant) {
        return response.notFound({ message: 'Plant not found.' })
      }

      const post = new CommunityPost({
        plant_id: plant._id,
        user_id: request['user'].id,
        is_public: is_public == 'on' ? true : false,
        status,
        message,
      })

      await post.save()

      if (is_public) {
        return response.redirect().toRoute('community.index')
      }

      return response.redirect().toRoute('admin.garden_manager.index')
    } catch (err) {
      console.error('Error creating community post:', err)
      return response.internalServerError({ message: 'Failed to create community post.' })
    }
  }

  async growth({ view }: HttpContext) {
    return view.render('admin/garden_manager/growth')
  }

  async harvest({ view }: HttpContext) {
    return view.render('admin/garden_manager/harvest')
  }

  async pest({ view }: HttpContext) {
    return view.render('admin/garden_manager/pest')
  }
}
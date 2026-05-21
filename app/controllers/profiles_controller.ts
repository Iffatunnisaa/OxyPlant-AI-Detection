import type { HttpContext } from '@adonisjs/core/http'
import Plant from '#models/plant'
import CommunityPost from '#models/community_post'
import User from '#models/user'

export default class ProfilesController {
  async index({ view, request }: HttpContext) {
    const user = request['user']
    if (!user || !user.id) {
      throw new Error('User ID not available')
    }
    const userId = user.id
    const plants = await Plant.find({ 'user_id': userId })
    const posts = await CommunityPost.find({ 'user_id': userId })
      .sort({ createdAt: -1 })
      .populate('plant_id')
    return view.render('pages/profil', { posts, plants })
  }

  async update({ request, response }: HttpContext) {
    const user = request['user']
    if (!user || !user.id) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    try {
      const { fullname, email, password } = request.only(['fullname', 'email', 'password'])

      const updateData: any = {}
      if (fullname && fullname.trim()) {
        updateData.fullname = fullname.trim()
      }
      if (email && email.trim()) {
        updateData.email = email.trim()
      }
      if (password && password.trim()) {
        updateData.password = password
      }

      if (Object.keys(updateData).length === 0) {
        return response.status(400).json({ message: 'No data to update' })
      }

      await User.updateOne({ _id: user.id }, { $set: updateData })

      return response.status(200).json({
        message: 'Profile updated successfully',
        success: true,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return response.status(500).json({
        message: 'Failed to update profile',
        error: errorMessage,
      })
    }
  }
}
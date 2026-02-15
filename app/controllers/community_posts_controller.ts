import type { HttpContext } from '@adonisjs/core/http'
import CommunityPost from '#models/community_post'

export default class CommunityPostsController {
  async index({ view }: HttpContext) {
    const posts = await CommunityPost.find({ is_public: true })
      .sort({ createdAt: -1 })
      .populate({
        path: 'plant_id',
      })
      .populate({
        path: 'user_id',
      })

    console.log('Community Posts:', posts)

    return view.render('pages/community/index', {
      posts,
    })
  }
}
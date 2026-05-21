import type { HttpContext } from '@adonisjs/core/http'
import CommunityPost from '#models/community_post'
import CommunityFeedback from '#models/community_feedback'
import DetectionResult from '#models/detection_result'
import CommunityService from '#services/community_service'

export default class CommunityPostsController {
  async index({ request, view }: HttpContext) {
    const filter = request.input('filter')
    const plant = request.input('plant')
    const page = Number(request.input('page') || 1)
    const currentUser = request['user'] || null

    const posts = await CommunityService.listFeed({ filter, plant, page, perPage: 12 })

    const draftDetections = currentUser?.id
      ? await DetectionResult.find({
          user_id: currentUser.id,
          status: 'success',
          is_shared: false,
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .select('plant_name disease_name confidence source_image createdAt')
      : []

    const shareCandidates = draftDetections.map((item) => {
      const confidence = Number(item.confidence)
      const normalizedConfidence = Number.isNaN(confidence)
        ? null
        : Math.max(0, Math.min(100, Math.round(confidence <= 1 ? confidence * 100 : confidence)))

      return {
        ...item.toObject(),
        imageUrl: item?.source_image?.filename ? `/uploads/${item.source_image.filename}` : null,
        confidenceLabel: normalizedConfidence === null ? '-' : `${normalizedConfidence}%`,
      }
    })

    return view.render('pages/community/community_feed', {
      posts,
      shareCandidates,
      currentUser,
    })
  }

  async show({ params, request, view }: HttpContext) {
    const id = params.id
    try {
      const post = await CommunityService.getPostDetail(id)
      return view.render('pages/community/post', { post, currentUser: request['user'] || null })
    } catch (err) {
      return view.render('errors/not-found')
    }
  }

  async publish({ request, response }: HttpContext) {
    const currentUser = request.user
    if (!currentUser) return response.unauthorized()

    const payload = {
      detectionId: request.input('detection_result_id'),
      title: String(request.input('title') || '').trim(),
      body: String(request.input('body') || '').trim(),
      discussionType: request.input('discussion_type'),
      coverPath: request.input('cover_path') || null,
    }

    if (!payload.title || !payload.body || !payload.discussionType) {
      return response.badRequest('Missing required fields')
    }

    if (!payload.detectionId) {
      return response.badRequest('Detection result is required before publishing')
    }

    try {
      const post = await CommunityService.createPostFromDetection(currentUser.id, payload.detectionId, payload)
      return response.redirect().toRoute('community.index')
    } catch (err) {
      return response.badRequest(err.message)
    }
  }

  async comment({ params, request, response }: HttpContext) {
    const currentUser = request.user
    if (!currentUser) return response.unauthorized()

    const postId = params.id
    const body = String(request.input('body') || '').trim()
    const parent = request.input('parent') || null
    if (!body) return response.badRequest('Comment body required')

    try {
      await CommunityService.addComment(currentUser.id, postId, body, parent)
      return response.redirect().back()
    } catch (err) {
      return response.badRequest(err.message)
    }
  }

  async comments({ params, request, response }: HttpContext) {
    const postId = params.id
    const page = Number(request.input('page') || 1)
    const perPage = 10

    try {
      const comments = await CommunityFeedback.find({ post: postId, isHidden: false })
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate({ path: 'user', select: 'fullname username avatar_path' })

      return response.send({ data: comments })
    } catch (err) {
      return response.badRequest(err.message)
    }
  }
}

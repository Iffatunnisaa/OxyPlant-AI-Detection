import CommunityPost from '#models/community_post'
import CommunityFeedback from '#models/community_feedback'
import DetectionResult from '#models/detection_result'
import { Types } from 'mongoose'

function normalizeConfidenceValue(confidence: unknown) {
  const numericConfidence = Number(confidence)
  if (Number.isNaN(numericConfidence)) {
    return null
  }

  const normalized = numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence
  return Math.max(0, Math.min(100, Math.round(normalized)))
}

function sanitizeLocalUploadPath(filePath?: string | null) {
  if (!filePath || filePath.startsWith('/uploads/')) {
    return null
  }

  return filePath
}

function getFallbackCoverPath(detection: any) {
  return sanitizeLocalUploadPath(detection?.coverPath) || null
}

class CommunityService {
  static async createPostFromDetection(userId: string, detectionId: string, payload: any) {
    const detection = await DetectionResult.findById(detectionId)
    if (!detection) throw new Error('Detection not found')
    if (String(detection.user_id) !== String(userId)) throw new Error('Not owner of detection')

    const post = await CommunityPost.create({
      author: new Types.ObjectId(userId),
      detectionResult: detection._id,
      plantName: payload.plantName || detection.plant_name || null,
      diseaseLabel: payload.diseaseLabel || detection.disease_name || null,
      confidence: normalizeConfidenceValue(payload.confidence ?? detection.confidence),
      severity: payload.severity || 'low',
      title: payload.title,
      body: payload.body,
      coverPath: payload.coverPath || getFallbackCoverPath(detection),
      dssPreview: payload.dssPreview || (detection.raw_prediction ? { top: detection.raw_prediction } : null),
      discussionType: payload.discussionType,
      isPublished: true,
      publishedAt: new Date(),
    })

    detection.is_shared = true
    detection.shared_post = post._id
    await detection.save()

    return post
  }

  static async listFeed({ filter, plant, sort, page = 1, perPage = 12 }: any) {
    const match: any = { isPublished: true }
    if (plant) match.plantName = plant
    if (filter === 'unanswered') match.feedbackCount = 0
    if (filter === 'critical') match.severity = 'critical'

    const sortBy: any = {}
    if (sort === 'most_discussed') sortBy.feedbackCount = -1
    else sortBy.createdAt = -1

    const skip = (page - 1) * perPage

    const pipeline = [
      { $match: match },
      { $sort: sortBy },
      {
        $lookup: {
          from: 'detectionresults',
          localField: 'detectionResult',
          foreignField: '_id',
          as: 'detectionResultDoc',
        },
      },
      { $unwind: { path: '$detectionResultDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          body: 1,
          plantName: 1,
          diseaseLabel: 1,
          confidence: 1,
          severity: 1,
          coverPath: 1,
          dssPreview: 1,
          discussionType: 1,
          feedbackCount: 1,
          createdAt: 1,
          author: 1,
          sourceImageFilename: '$detectionResultDoc.source_image.filename',
        },
      },
      { $skip: skip },
      { $limit: perPage },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password':0, 'author.email':0 } }
    ]

    const result = await CommunityPost.aggregate(pipeline)

    return result.map((post: any) => ({
      ...post,
      confidenceLabel: normalizeConfidenceValue(post.confidence),
      coverPath: sanitizeLocalUploadPath(post.coverPath),
      coverImageUrl: null,
      createdAtLabel: post.createdAt
        ? new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(post.createdAt))
        : '-',
    }))
  }

  static async getPostDetail(postId: string) {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(postId) } },
      {
        $lookup: {
          from: 'detectionresults',
          localField: 'detectionResult',
          foreignField: '_id',
          as: 'detectionResultDoc',
        },
      },
      { $unwind: { path: '$detectionResultDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          body: 1,
          plantName: 1,
          diseaseLabel: 1,
          confidence: 1,
          severity: 1,
          coverPath: 1,
          dssPreview: 1,
          discussionType: 1,
          feedbackCount: 1,
          createdAt: 1,
          publishedAt: 1,
          author: 1,
          sourceImageFilename: '$detectionResultDoc.source_image.filename',
        },
      },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password': 0, 'author.email': 0 } },
    ]

    const result = await CommunityPost.aggregate(pipeline)
    if (!result || result.length === 0) throw new Error('Post not found')

    const post = result[0]
    return {
      ...post,
      coverPath: sanitizeLocalUploadPath(post.coverPath),
      sourceImageUrl: null,
    }
  }

  static async addComment(userId: string, postId: string, body: string, parentId?: string) {
    const post = await CommunityPost.findById(postId)
    if (!post) throw new Error('Post not found')

    const comment = await CommunityFeedback.create({ post: post._id, user: new Types.ObjectId(userId), parent: parentId || null, body })
    // increment counter atomically
    await CommunityPost.findByIdAndUpdate(post._id, { $inc: { feedbackCount: 1 } })
    return comment
  }
}

export default CommunityService

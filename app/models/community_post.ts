import mongoose from 'mongoose'

const CommunityPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    detectionResult: { type: mongoose.Schema.Types.ObjectId, ref: 'DetectionResult', default: null },
    plantName: { type: String, default: null, index: true },
    diseaseLabel: { type: String, default: null },
    confidence: { type: Number, default: null },
    severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low', index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    coverPath: { type: String, default: null },
    dssPreview: { type: mongoose.Schema.Types.Mixed, default: null },
    discussionType: {
      type: String,
      enum: ['Need Help', 'Want Confirmation', 'Sharing Experience', 'Warning Others'],
      required: true,
      index: true,
    },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null },
    feedbackCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
)

CommunityPostSchema.index({ createdAt: -1 })

export default mongoose.model('CommunityPost', CommunityPostSchema)

import mongoose from 'mongoose'

const DetectionResultSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: false },
    source_image: {
      filename: { type: String, required: true },
      mime: { type: String, required: false },
      size: { type: Number, required: false },
    },
    ai_provider: { type: String, default: 'fastapi' },
    ai_endpoint: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    plant_name: { type: String, required: false },
    disease_name: { type: String, required: false },
    confidence: { type: Number, required: false },
    raw_prediction: { type: mongoose.Schema.Types.Mixed, required: false },
    latency_ms: { type: Number, required: false },
    error_message: { type: String, required: false },
    is_shared: { type: Boolean, default: false, index: true },
    shared_post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', default: null },
  },
  { timestamps: true }
)

export default mongoose.model('DetectionResult', DetectionResultSchema)

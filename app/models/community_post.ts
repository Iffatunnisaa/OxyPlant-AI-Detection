import mongoose from 'mongoose'

const CommunityPostSchema = new mongoose.Schema(
  {
    plant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    is_public: { type: Boolean, default: false },
    status: { type: String, enum: ['tumbuh', 'siap panen', 'terkena hama'], default: 'tumbuh' },
    message: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('CommunityPost', CommunityPostSchema)

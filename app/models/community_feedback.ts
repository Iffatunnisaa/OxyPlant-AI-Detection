import mongoose from 'mongoose'

const CommunityFeedbackSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityFeedback', default: null },
    body: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.model('CommunityFeedback', CommunityFeedbackSchema)
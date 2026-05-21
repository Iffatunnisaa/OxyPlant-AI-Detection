import mongoose from 'mongoose'

const PlantSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['sayuran', 'buah', 'herbal', 'hias', 'lainnya'], required: true },
    plant_date: { type: Date, required: true },
    last_watered_at: { type: Date, required: false },
    last_treated_at: { type: Date, required: false },
    harvested_at: { type: Date, required: false },
    photo_path: { type: String, required: false },
    notes: { type: String, required: false },
  },
  { timestamps: true }
)

export default mongoose.model('Plant', PlantSchema)

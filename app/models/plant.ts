import mongoose from 'mongoose'

const PlantSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['sayuran', 'buah', 'herbal', 'hias', 'lainnya'], required: true },
    plant_date: { type: Date, required: true },
    watering_schedule: { type: Number, required: true },
    photo_path: { type: String, required: false },
    notes: { type: String, required: false },
  },
  { timestamps: true }
)

export default mongoose.model('Plant', PlantSchema)

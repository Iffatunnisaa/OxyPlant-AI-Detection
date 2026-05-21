import mongoose from 'mongoose'

const PlantInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
    care: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    diseases: [
      {
        name: { type: String, required: true },
        gejala: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('PlantInfo', PlantInfoSchema)

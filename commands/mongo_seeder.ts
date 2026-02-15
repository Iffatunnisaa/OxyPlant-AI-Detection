import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import Plant from '#models/plant'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

export default class MongoSeeder extends BaseCommand {
  static commandName = 'mongo:seeder'
  static description = 'Seed the database with initial data'

  static options: CommandOptions = {}

  async run() {
    try {
      if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adonis_mongo_auth'
        // Replace with your actual connection string or load from .env
        await mongoose.connect(mongoUri, {
          dbName: 'adonis_mongo_auth',
        })
      }

      // Clear the database (drop all collections)
      await mongoose.connection.dropDatabase()
      this.logger.info('🧹 Database cleared')

      // Seed users
      const user = await User.create({
        fullname: 'Iffatun Nisa Nasrullah',
        username: 'iffa',
        email: 'iffa@example.com',
        password: await bcrypt.hash('password', 10),
      })

      await Plant.create([
        {
          user_id: user._id,
          name: 'Tomat Cherry',
          type: 'sayuran',
          plant_date: new Date(),
          watering_schedule: 2,
          photo_path: '/resources/img/tomat_ceri.jpeg',
          notes:
            'Tomat kecil berbentuk bulat, rasanya manis dan segar. Cocok untuk salad, garnish, atau camilan sehat.',
        },
        {
          user_id: user._id,
          name: 'Basil',
          type: 'herbal',
          plant_date: new Date(),
          watering_schedule: 1,
          photo_path: '/resources/img/basil.jpeg',
          notes:
            'Daun herbal aromatik yang sering digunakan dalam masakan Italia seperti pasta dan pizza. Memiliki aroma khas yang segar.',
        },
        {
          user_id: user._id,
          name: 'Cabai Rawit',
          type: 'sayuran',
          plant_date: new Date(),
          watering_schedule: 3,
          photo_path: '/resources/img/rawit.jpeg',
          notes:
            'Cabai kecil berwarna merah dan kuning dengan rasa sangat pedas. Umum dipakai sebagai sambal atau pelengkap masakan pedas.',
        },
        {
          user_id: user._id,
          name: 'Daun Mint',
          type: 'herbal',
          plant_date: new Date(),
          watering_schedule: 1,
          photo_path: '/resources/img/mint.jpeg',
          notes:
            'Daun dengan aroma segar dan rasa dingin. Sering digunakan dalam minuman, teh, atau sebagai garnish makanan penutup.',
        },
        {
          user_id: user._id,
          name: 'Selada',
          type: 'sayuran',
          plant_date: new Date(),
          watering_schedule: 1,
          photo_path: '/resources/img/selada.jpeg',
          notes:
            'Sayuran berdaun hijau yang renyah. Populer sebagai bahan utama salad dan sandwich karena teksturnya yang ringan.',
        },
        {
          user_id: user._id,
          name: 'Rosemary',
          type: 'herbal',
          plant_date: new Date(),
          watering_schedule: 4,
          photo_path: '/resources/img/rosemary.jpeg',
          notes:
            'Tanaman herbal dengan daun seperti jarum dan aroma tajam. Umum digunakan untuk bumbu daging panggang dan kentang.',
        },
      ])

      this.logger.success('✅ Seed complete')
    } catch (err) {
      this.logger.error('❌ Seeding failed: ' + err.message)
    } finally {
      await mongoose.disconnect()
      process.exit(0)
    }
  }
}

import { BaseCommand } from '@adonisjs/core/ace'
import { args } from '@adonisjs/core/ace'
import User from '#models/user'

export default class MakeAdmin extends BaseCommand {
  static commandName = 'make:admin'
  static description = 'Make a user an admin'
  
  @args.string({ description: 'User email to promote to admin' })
  declare email: string

  async run() {
    try {
      const user = await User.findOne({ email: this.email })
      
      if (!user) {
        this.logger.error(`User with email "${this.email}" not found`)
        return
      }

      if (user.role === 'admin') {
        this.logger.info(`User "${this.email}" is already an admin`)
        return
      }

      user.role = 'admin'
      await user.save()

      this.logger.success(`User "${this.email}" is now an admin! ✅`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Failed to promote user: ${message}`)
    }
  }
}

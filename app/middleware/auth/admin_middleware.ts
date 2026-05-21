import { HttpContext } from '@adonisjs/core/http'

export default class AdminMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const user = request.user
    
    if (!user) {
      return response.redirect().toRoute('auth.login')
    }

    if (user.role !== 'admin') {
      return response.status(403).json({ message: 'Unauthorized. Admin access required.' })
    }

    await next()
  }
}

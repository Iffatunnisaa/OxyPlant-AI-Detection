import type { HttpContext } from '@adonisjs/core/http'

export default class GuestMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('token')

    if (token) {
      return response.redirect().toRoute('admin.garden_manager.index')
    }

    await next()
  }
}
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class GuestMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('token')

    if (token) {
      try {
        const payload = jwt.verify(token, env.get('JWT_SECRET')) as { role?: string }
        if (payload.role === 'admin') {
          return response.redirect().toRoute('admin.dashboard')
        }
      } catch {
        response.clearCookie('token', { path: '/' })
        return response.redirect().toRoute('auth.login')
      }

      return response.redirect().toRoute('garden_manager.index')
    }

    await next()
  }
}

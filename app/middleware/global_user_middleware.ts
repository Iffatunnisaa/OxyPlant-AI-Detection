import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class GlobalUserMiddleware {
  async handle({ request, view }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('token')
    let user = null

    if (token) {
      try {
        const payload = jwt.verify(token, env.get('JWT_SECRET')) as { id: string }
        const userDoc = await User.findById(payload.id).lean()

        if (userDoc) {
          user = {
            ...userDoc,
            id: String(userDoc._id),
          }
        }
      } catch {
        user = null
      }
    }

    view.share({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    })

    await next()
  }
}

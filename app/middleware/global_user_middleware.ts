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
        user = await User.findById(payload.id).lean()
      } catch {
        user = null
      }
    }

    // Share user (null if not logged in) with all views
    view.share({ user })
    
    await next()
  }
}

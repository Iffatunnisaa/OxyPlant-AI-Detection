import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

declare module '@adonisjs/core/http' {
  interface Request {
    user?: {
      id: string
      email: string
      role: string
    }
  }
}

export default class AuthMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('token')

    if (!token) {
      return response.redirect().toRoute('auth.login')
    }

    try {
      const decoded = jwt.verify(token, env.get('JWT_SECRET'))
      request.user = decoded as { id: string; email: string; role: string }
      await next()
    } catch {
      response.clearCookie('token', { path: '/' })
      return response.redirect().toRoute('auth.login')
    }
  }
}

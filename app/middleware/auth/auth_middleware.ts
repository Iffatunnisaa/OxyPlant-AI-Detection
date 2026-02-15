import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

// Extend the Request interface to include 'user'
declare module '@adonisjs/core/http' {
  interface Request {
    user?: {
      id: string;
      email: string;
    }
  }
}


export default class AuthMiddleware {
  async handle({ request, response, view }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('token')

    if (!token) {
      return response.redirect().toRoute('auth.login')
    }

    try {      
      const decoded = jwt.verify(token, env.get('JWT_SECRET'))
      request['user'] = decoded as { id: string; email: string }
      
      view.share({ user: decoded })

      await next()
    } catch (err) {
      response.clearCookie('token')
      return response.redirect().toRoute('auth.login')
    }
  }
}

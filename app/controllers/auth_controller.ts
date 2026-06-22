import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from "#start/env"
import { registerValidator } from '#validators/register_validator'
import { loginValidator } from '#validators/login_validator'

const ADMIN_EMAILS = ['admin@gmail.com']

function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const existingUser = await User.findOne({
      email: payload.email
    })

    if (existingUser) {
      return response.badRequest('Email sudah terdaftar')
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10)

    const role = isAdminEmail(payload.email)
    ? 'admin'
    : 'user'

    await User.create({
      fullname: payload.fullname,
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      role,
    })
    return response.redirect().toRoute('auth.login')
  }
  
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    
    const user = await User.findOne({
      email: payload.email
    })

    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      return response.redirect().toRoute('auth.login')
    }

    if (isAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin'
      await user.save()
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      env.get('JWT_SECRET'),
      { expiresIn: '1h' }
    )
    
    response.cookie('token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })

    if (user.role === 'admin') {
      return response.redirect().toRoute('admin.dashboard')
    }
    
    return response.redirect().toRoute('garden_manager.index')
  }

  async logout({ response }: HttpContext) {
    response.clearCookie('token', {
      path: '/',
      httpOnly: true,
    })
    return response.redirect('/')
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from "#start/env"

const ADMIN_EMAILS = ['admin@gmail.com']

function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export default class AuthController {
  async register({ request, response }: HttpContext) {
    // const { email, password } = request.only(['email', 'password'])
    const {
      fullname,
      username,
      email,
      password
    } = request.only(['fullname', 'username', 'email', 'password'])

    const hashedPassword = await bcrypt.hash(password, 10)
    const role = isAdminEmail(email) ? 'admin' : 'user'

    try {
      await User.create({ fullname, username, email, password: hashedPassword, role })
      return response.redirect().toRoute('auth.login')
    } catch (err) {
      return response.badRequest('User already exists')
    }
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
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

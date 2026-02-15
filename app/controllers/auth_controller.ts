import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from "#start/env"

export default class AuthController {
  async register({ request, response }: HttpContext) {
    // const { email, password } = request.only(['email', 'password'])
    const {
      fullname,
      username,
      email,
      password,
      confirmPassword
    } = request.only(['fullname', 'username', 'email', 'password', 'confirmPassword'])
    if (password !== confirmPassword) {
      return response.badRequest('Passwords do not match')
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      await User.create({ fullname, username, email, password: hashedPassword })
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

    const token = jwt.sign(
      { id: user._id, email: user.email },
      env.get('JWT_SECRET'),
      { expiresIn: '1h' }
    )

    response.cookie('token', token, {
      httpOnly: true,
    })

    return response.redirect().toRoute('admin.garden_manager.index')
  }

  async logout({ response }: HttpContext) {
    response.clearCookie('token')
    return response.redirect().toRoute('auth.login')
  }
}

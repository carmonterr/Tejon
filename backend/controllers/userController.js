// backend/controllers/userController.js
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import sendEmail from '../utils/sendEmail.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// ✅ Registro de usuario
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // 🔍 Verificar si el correo ya está registrado
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError('❌ El correo ya está registrado. Intenta con otro.', 400, 'EMAIL_IN_USE')
  }

  // 🔐 Generar código aleatorio de verificación
  const verificationCode = crypto.randomInt(100000, 999999).toString()
  const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  // 🧑‍💻 Crear el usuario en la base de datos
  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    verificationCode,
    verificationCodeExpires,
  })

  // 📧 Enviar correo de verificación
  await sendEmail({
    to: email,
    subject: 'Código de verificación',
    text: `Hola ${name}, tu código de verificación es: ${verificationCode}`,
  })

  console.log('✔️ Usuario registrado')
  console.log('✔️ Código de verificación enviado')

  // ✅ Respuesta al cliente
  res.status(201).json({
    message: '✅ Registro exitoso. Revisa tu correo para verificar tu cuenta.',
    userId: user._id,
  })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  const user = await User.findOne({ email })

  // ❌ No se encontró el usuario
  if (!user) {
    throw new ApiError(
      '❌ Error: No se encontró una cuenta registrada con este correo.',
      404,
      'USER_NOT_FOUND'
    )
  }

  // ⚠️ Ya está verificado
  if (user.isVerified) {
    throw new ApiError('⚠️ Esta cuenta ya fue verificada previamente.', 400, 'ALREADY_VERIFIED')
  }

  // ❌ Código inválido
  if (user.verificationCode !== code) {
    throw new ApiError(
      '❌ El código ingresado no es válido. Verifica tu correo.',
      400,
      'INVALID_CODE'
    )
  }

  // ⏰ Código expirado
  if (user.verificationCodeExpires < Date.now()) {
    throw new ApiError(
      '⏰ El código de verificación ha expirado. Solicita uno nuevo.',
      400,
      'CODE_EXPIRED'
    )
  }

  // ✅ Marcar como verificado
  user.isVerified = true
  user.verificationCode = undefined
  user.verificationCodeExpires = undefined

  await user.save()

  console.log('✔️ Cuenta verificada')

  res.json({
    message: '✅ Tu cuenta ha sido verificada correctamente.',
  })
})

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(
      '❌ Error: El correo o la contraseña no son correctos. Verifica tus credenciales.',
      400,
      'INVALID_CREDENTIALS'
    )
  }

  if (!user.isVerified) {
    throw new ApiError(
      '⚠️ Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo.',
      403,
      'ACCOUNT_NOT_VERIFIED'
    )
  }

  if (user.loginBlockedUntil && user.loginBlockedUntil > Date.now()) {
    throw new ApiError(
      '🚫 Demasiados intentos fallidos. Intenta nuevamente en unos minutos.',
      429,
      'LOGIN_BLOCKED',
      {
        blockedUntil: user.loginBlockedUntil,
      }
    )
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    user.loginAttempts += 1
    user.loginLastAttempt = new Date()

    if (user.loginAttempts >= 5) {
      user.loginBlockedUntil = new Date(Date.now() + 10 * 60 * 1000)
    }

    await user.save()

    if (user.loginBlockedUntil && user.loginBlockedUntil > Date.now()) {
      throw new ApiError(
        '🚫 Has alcanzado el límite de intentos. Intenta nuevamente en 10 minutos.',
        429,
        'LOGIN_BLOCKED',
        {
          blockedUntil: user.loginBlockedUntil,
        }
      )
    }

    throw new ApiError(
      '❌ Error: El correo o la contraseña no son correctos.',
      400,
      'INVALID_CREDENTIALS'
    )
  }

  user.loginAttempts = 0
  user.loginBlockedUntil = null
  await user.save()

  console.log('✔️ Inicio de sesión exitoso')

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin || false,
    token: generateToken(user._id),
  })
})

// ✅ Perfil del usuario
// ✅ Obtener perfil del usuario autenticado
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')

  if (!user) {
    throw new ApiError(
      '❌ Error: No se encontró el perfil del usuario. Intenta iniciar sesión nuevamente.',
      404,
      'USER_NOT_FOUND'
    )
  }

  console.log('✔️ Perfil cargado correctamente para')

  res.json(user)
})

// ✅ Obtener lista de usuarios con paginación y búsqueda
// GET /api/users?page=1&limit=5&search=admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 5
  const search = req.query.search?.trim() || ''

  const query = {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  }

  const total = await User.countDocuments(query)

  const users = await User.find(query)
    .select('-password')
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })

  console.log('✔️ Usuarios encontrados')

  res.json({
    users,
    page,
    pages: Math.ceil(total / limit),
  })
})

// ✅ Eliminar un usuario (solo para admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    throw new ApiError(
      '❌ Error: Usuario no encontrado. Verifica el ID proporcionado.',
      404,
      'USER_NOT_FOUND'
    )
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError('⚠️ No puedes eliminar tu propia cuenta.', 400, 'CANNOT_DELETE_SELF')
  }

  await user.deleteOne()

  console.log('✔️ Usuario eliminado')

  res.json({ message: '✅ Usuario eliminado correctamente.' })
})
// ✅ Actualizar un usuario
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    throw new ApiError(
      '❌ Error: No se encontró el usuario que deseas actualizar.',
      404,
      'USER_NOT_FOUND'
    )
  }

  const { name, email, isAdmin } = req.body

  if (name !== undefined) user.name = name
  if (email !== undefined) user.email = email
  if (isAdmin !== undefined) user.isAdmin = isAdmin

  const updatedUser = await user.save()

  console.log('✔️ Usuario actualizado')

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    message: '✅ Usuario actualizado correctamente.',
  })
})

// Controlador: forgotPassword
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(
      '❌ Error: No existe ninguna cuenta asociada a este correo electrónico.',
      404,
      'EMAIL_NOT_FOUND'
    )
  }

  // 🔒 Límite: máximo 3 intentos por día
  const MAX_ATTEMPTS = 3
  const now = new Date()

  if (user.resetPasswordLastAttempt) {
    const last = new Date(user.resetPasswordLastAttempt)
    const isSameDay = now.toDateString() === last.toDateString()

    if (isSameDay && user.resetPasswordAttempts >= MAX_ATTEMPTS) {
      throw new ApiError(
        '⚠️ Has alcanzado el límite de solicitudes de recuperación para hoy. Intenta nuevamente mañana.',
        429,
        'RESET_ATTEMPTS_EXCEEDED',
        {
          attemptsUsed: user.resetPasswordAttempts,
          maxAttempts: MAX_ATTEMPTS,
        }
      )
    }

    if (isSameDay) {
      user.resetPasswordAttempts += 1
    } else {
      user.resetPasswordAttempts = 1
      user.resetPasswordLastAttempt = now
    }
  } else {
    user.resetPasswordAttempts = 1
    user.resetPasswordLastAttempt = now
  }

  // 🔁 Limpiar tokens anteriores
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  // 🔐 Generar nuevo token plano
  const rawToken = crypto.randomBytes(32).toString('hex')

  // 🔐 Hashearlo y guardarlo
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.resetPasswordToken = hashedToken
  user.resetPasswordExpires = Date.now() + 40 * 60 * 1000

  await user.save()

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`

  console.log('🔗 Enlace completo de recuperación:', resetUrl)

  await sendEmail({
    to: user.email,
    subject: 'Recuperación de contraseña',
    text: `Hola ${user.name},\n\nAccede a este enlace para recuperar tu contraseña:\n${resetUrl}\n\nEste enlace expirará en 40 minutos.`,
  })

  res.json({
    message: '✅ Correo de recuperación enviado correctamente. Revisa tu bandeja de entrada.',
  })
})
// ✅ Restablecer contraseña
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  console.log('👉 Token plano recibido:', token)
  // 🔐 Hashear el token recibido
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // 🔍 Buscar usuario con token hasheado y válido
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  })

  if (!user) {
    throw new ApiError(
      '❌ Error: El token es inválido o ha expirado. Solicita uno nuevo.',
      400,
      'INVALID_OR_EXPIRED_TOKEN'
    )
  }

  // 🔐 Actualizar contraseña y limpiar token
  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  await user.save()

  console.log('✔️ Contraseña actualizada')

  res.json({
    message: '✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
  })
})

// ✅ Actualiza el perfil del usuario autenticado
// controllers/userController.js

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError('❌ Usuario no encontrado', 404, 'USER_NOT_FOUND')
  }

  const { phone, address, city, country } = req.body

  // Validación fuerte para evitar campos vacíos
  if (!phone?.trim()) {
    throw new ApiError('❌ El teléfono es obligatorio.', 400, 'PHONE_REQUIRED')
  }
  if (!address?.trim()) {
    throw new ApiError('❌ La dirección es obligatoria.', 400, 'ADDRESS_REQUIRED')
  }
  if (!city?.trim()) {
    throw new ApiError('❌ La ciudad es obligatoria.', 400, 'CITY_REQUIRED')
  }
  if (!country?.trim()) {
    throw new ApiError('❌ El país es obligatorio.', 400, 'COUNTRY_REQUIRED')
  }

  user.phone = phone
  user.shippingAddress = {
    address: address.trim(),
    city: city.trim(),
    country: country.trim(),
  }

  const updatedUser = await user.save()

  res.status(200).json({
    message: '✅ Perfil actualizado correctamente.',
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      shippingAddress: updatedUser.shippingAddress,
    },
  })
})

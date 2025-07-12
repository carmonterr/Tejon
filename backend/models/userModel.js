import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    address: String,
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    // Verificación por email
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },
    loginLastAttempt: {
      type: Date,
      default: null,
    },
    loginBlockedUntil: {
      type: Date,
      default: null,
    },

    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    resetPasswordLastAttempt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ✅ Hashear la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next() // Solo si la contraseña fue modificada
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

const User = mongoose.model('User', userSchema)
export default User

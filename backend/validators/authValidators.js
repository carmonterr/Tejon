import { body } from 'express-validator'

export const registerValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),

  body('email').isEmail().withMessage('Debe ser un correo válido'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
]

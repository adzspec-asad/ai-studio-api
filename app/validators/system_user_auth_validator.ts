import vine from '@vinejs/vine'

/**
 * Validator for system user login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail(),
    password: vine
      .string()
      .minLength(6)
  })
)

/**
 * Validator for system user registration
 */
export const registerValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(100)
      .trim(),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('system_users').where('email', value).first()
        return !user
      }),
    password: vine
      .string()
      .minLength(8)
      .confirmed(),
    role: vine
      .enum(['superadmin', 'admin', 'support'])
      .optional()
  })
)

/**
 * Validator for updating system user profile
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(100)
      .trim()
      .optional(),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .optional(),
    password: vine
      .string()
      .minLength(8)
      .confirmed()
      .optional()
  })
)

/**
 * Validator for creating access tokens
 */
export const createTokenValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(1)
      .maxLength(100)
      .trim()
      .optional(),
    abilities: vine
      .array(vine.string())
      .optional(),
    expiresIn: vine
      .string()
      .optional()
  })
)

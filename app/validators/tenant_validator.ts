import vine from '@vinejs/vine'

/**
 * Validator for creating a new tenant
 */
export const createTenantValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(100)
      .trim(),
    slug: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .regex(/^[a-z0-9-]+$/)
      .trim()
      .unique(async (db, value) => {
        const tenant = await db.from('tenants').where('slug', value).first()
        return !tenant
      }),
    dbHost: vine
      .string()
      .optional(),
    dbPort: vine
      .number()
      .min(1)
      .max(65535)
      .optional(),
    dbName: vine
      .string()
      .minLength(1)
      .maxLength(63)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
    dbUser: vine
      .string()
      .minLength(1)
      .maxLength(63)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
    dbPassword: vine
      .string()
      .minLength(8)
      .optional(),
    status: vine
      .enum(['active', 'inactive'])
      .optional()
  })
)

/**
 * Validator for updating a tenant
 */
export const updateTenantValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(100)
      .trim()
      .optional(),
    status: vine
      .enum(['active', 'inactive'])
      .optional()
  })
)

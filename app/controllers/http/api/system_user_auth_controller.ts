import type { HttpContext } from '@adonisjs/core/http'
import SystemUserModel from '#models/system_user_model'
import { loginValidator, registerValidator } from '#validators/system_user_auth_validator'

export default class SystemUserAuthController {
  /**
   * Login a system user and return an access token
   */
  async login({ request, auth, response }: HttpContext) {
    try {
      // Validate the request data
      const { email, password } = await request.validateUsing(loginValidator)

      // Verify user credentials
      const user = await SystemUserModel.verifyCredentials(email, password)

      // Create an access token for the user
      const token = await auth.use('system-user').createToken(user, ['*'], {
        name: 'System User Login Token',
        expiresIn: '24 hours'
      })

      return response.ok({
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token: {
            type: 'bearer',
            value: token.value!.release(),
            expiresAt: token.expiresAt
          }
        }
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Invalid credentials',
        error: error.message
      })
    }
  }

  /**
   * Register a new system user (typically for superadmin creating other admins)
   */
  async register({ request, auth, response }: HttpContext) {
    try {
      // Only superadmin can create new system users
      const currentUser = auth.getUserOrFail()
      if (currentUser.role !== 'superadmin') {
        return response.forbidden({
          message: 'Only superadmin can create new system users'
        })
      }

      // Validate the request data
      const userData = await request.validateUsing(registerValidator)

      // Create the new system user
      const user = await SystemUserModel.create(userData)

      return response.created({
        message: 'System user created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create system user',
        error: error.message
      })
    }
  }

  /**
   * Get the current authenticated user's profile
   */
  async profile({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.ok({
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      })
    } catch (error) {
      return response.unauthorized({
        message: 'User not authenticated',
        error: error.message
      })
    }
  }

  /**
   * Logout the current user by revoking the current token
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      if (token) {
        await SystemUserModel.accessTokens.delete(user, token.identifier)
      }

      return response.ok({
        message: 'Logout successful'
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to logout',
        error: error.message
      })
    }
  }

  /**
   * Get all access tokens for the current user
   */
  async tokens({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const tokens = await SystemUserModel.accessTokens.all(user)

      return response.ok({
        message: 'Tokens retrieved successfully',
        data: {
          tokens: tokens.map(token => ({
            id: token.identifier,
            name: token.name,
            abilities: token.abilities,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            expiresAt: token.expiresAt,
            lastUsedAt: token.lastUsedAt
          }))
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve tokens',
        error: error.message
      })
    }
  }

  /**
   * Delete a specific access token
   */
  async deleteToken({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await SystemUserModel.accessTokens.delete(user, params.tokenId)

      return response.ok({
        message: 'Token deleted successfully'
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to delete token',
        error: error.message
      })
    }
  }

  /**
   * Create a new access token for the current user
   */
  async createToken({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { name, abilities = ['*'], expiresIn = '30 days' } = request.only(['name', 'abilities', 'expiresIn'])

      const token = await SystemUserModel.accessTokens.create(user, abilities, {
        name: name || 'API Token',
        expiresIn
      })

      return response.created({
        message: 'Token created successfully',
        data: {
          token: {
            type: 'bearer',
            value: token.value!.release(),
            name: token.name,
            abilities: token.abilities,
            expiresAt: token.expiresAt
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create token',
        error: error.message
      })
    }
  }
}
import type { HttpContext } from '@adonisjs/core/http'
import TenantOnboardingService from '#services/tenant_onboarding_service'
import Tenant from '#models/tenant_model'
import { createTenantValidator, updateTenantValidator } from '#validators/tenant_validator'

export default class TenantController {
  /**
   * Create a new tenant with automatic database provisioning
   */
  async create({ request, auth, response }: HttpContext) {
    try {
      // Only superadmin can create tenants
      const currentUser = auth.getUserOrFail()
      if (currentUser.role !== 'superadmin') {
        return response.forbidden({
          message: 'Only superadmin can create tenants'
        })
      }

      // Validate the request data
      const tenantData = await request.validateUsing(createTenantValidator)

      // Provision the tenant (creates database, user, runs migrations)
      const tenant = await TenantOnboardingService.provisionTenant(tenantData)

      return response.created({
        message: 'Tenant created successfully',
        data: {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            dbHost: tenant.dbHost,
            dbPort: tenant.dbPort,
            dbName: tenant.dbName,
            dbUser: tenant.dbUser,
            // Don't return the password for security
            status: tenant.status
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create tenant',
        error: error.message
      })
    }
  }

  /**
   * List all tenants
   */
  async index({ auth, response }: HttpContext) {
    try {
      // Only superadmin and admin can list tenants
      const currentUser = auth.getUserOrFail()
      if (!['superadmin', 'admin'].includes(currentUser.role)) {
        return response.forbidden({
          message: 'Insufficient permissions to list tenants'
        })
      }

      const tenants = await Tenant.all()

      return response.ok({
        message: 'Tenants retrieved successfully',
        data: {
          tenants: tenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            dbHost: tenant.dbHost,
            dbPort: tenant.dbPort,
            dbName: tenant.dbName,
            dbUser: tenant.dbUser,
            status: tenant.status
          }))
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve tenants',
        error: error.message
      })
    }
  }

  /**
   * Get a specific tenant by slug
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      // Only superadmin and admin can view tenant details
      const currentUser = auth.getUserOrFail()
      if (!['superadmin', 'admin'].includes(currentUser.role)) {
        return response.forbidden({
          message: 'Insufficient permissions to view tenant details'
        })
      }

      const tenant = await Tenant.findByOrFail('slug', params.slug)

      return response.ok({
        message: 'Tenant retrieved successfully',
        data: {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            dbHost: tenant.dbHost,
            dbPort: tenant.dbPort,
            dbName: tenant.dbName,
            dbUser: tenant.dbUser,
            status: tenant.status
          }
        }
      })
    } catch (error) {
      return response.notFound({
        message: 'Tenant not found',
        error: error.message
      })
    }
  }

  /**
   * Update a tenant (metadata only, not database structure)
   */
  async update({ params, request, auth, response }: HttpContext) {
    try {
      // Only superadmin can update tenants
      const currentUser = auth.getUserOrFail()
      if (currentUser.role !== 'superadmin') {
        return response.forbidden({
          message: 'Only superadmin can update tenants'
        })
      }

      const tenant = await Tenant.findByOrFail('slug', params.slug)
      const updateData = await request.validateUsing(updateTenantValidator)

      tenant.merge(updateData)
      await tenant.save()

      return response.ok({
        message: 'Tenant updated successfully',
        data: {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            dbHost: tenant.dbHost,
            dbPort: tenant.dbPort,
            dbName: tenant.dbName,
            dbUser: tenant.dbUser,
            status: tenant.status
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to update tenant',
        error: error.message
      })
    }
  }

  /**
   * Delete a tenant and its database (use with caution!)
   */
  async destroy({ params, auth, response }: HttpContext) {
    try {
      // Only superadmin can delete tenants
      const currentUser = auth.getUserOrFail()
      if (currentUser.role !== 'superadmin') {
        return response.forbidden({
          message: 'Only superadmin can delete tenants'
        })
      }

      // Remove tenant and its database
      await TenantOnboardingService.removeTenant(params.slug)

      return response.ok({
        message: 'Tenant deleted successfully'
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to delete tenant',
        error: error.message
      })
    }
  }
}

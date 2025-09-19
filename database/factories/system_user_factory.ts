import factory from '@adonisjs/lucid/factories'
import SystemUserModel from '#models/system_user_model'

export const SystemUserFactory = factory
  .define(SystemUserModel, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'Password123!', // Will be hashed automatically
      role: faker.helpers.arrayElement(['admin', 'support'] as const)
    }
  })
  .state('superadmin', (user) => {
    user.role = 'superadmin'
    user.email = 'superadmin@example.com'
    user.name = 'Super Administrator'
  })
  .state('admin', (user, { faker }) => {
    user.role = 'admin'
    user.email = faker.internet.email({ firstName: 'admin' })
    user.name = `Admin ${faker.person.lastName()}`
  })
  .state('support', (user, { faker }) => {
    user.role = 'support'
    user.email = faker.internet.email({ firstName: 'support' })
    user.name = `Support ${faker.person.lastName()}`
  })
  .build()
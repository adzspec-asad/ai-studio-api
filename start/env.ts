/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring master database connection
  |----------------------------------------------------------
  */
  MASTER_DB_HOST: Env.schema.string({ format: 'host' }),
  MASTER_DB_PORT: Env.schema.number(),
  MASTER_DB_USER: Env.schema.string(),
  MASTER_DB_PASSWORD: Env.schema.string.optional(),
  MASTER_DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for superadmin user seeding
  |----------------------------------------------------------
  */
  SUPERADMIN_EMAIL: Env.schema.string.optional(),
  SUPERADMIN_PASSWORD: Env.schema.string.optional(),
  SUPERADMIN_NAME: Env.schema.string.optional()
})

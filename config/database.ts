import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'master', // Default connection is the master DB

  connections: {
    master: {
      client: 'pg',
      connection: {
        host: env.get('MASTER_DB_HOST', '127.0.0.1'),
        port: Number(env.get('MASTER_DB_PORT', 5432)),
        user: env.get('MASTER_DB_USER', 'root'),
        password: env.get('MASTER_DB_PASSWORD', 'root'),
        database: env.get('MASTER_DB_DATABASE', 'ai-studio-master'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations/master'], // keep master migrations separate
      },
    },

    tenant: {
      client: 'pg',
      connection: {}, // dynamically injected at runtime
      migrations: {
        naturalSort: true,
        paths: ['database/migrations/tenant'], // tenant schema migrations
      },
    },
  },
})

export default dbConfig

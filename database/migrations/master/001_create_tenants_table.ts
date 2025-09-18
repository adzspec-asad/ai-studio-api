import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tenants'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().notNullable()
      table.string('name').notNullable()
      table.string('slug').unique().notNullable()
      table.string('db_host').notNullable()
      table.integer('db_port').notNullable()
      table.string('db_name').notNullable()
      table.string('db_user').notNullable()
      table.string('db_password').notNullable()
      table.string('status').defaultTo('active').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

// app/Models/Tenant.ts
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TenantModel extends BaseModel {

    public static connection = 'master' // Always use master DB
  
    @column({ isPrimary: true })
    public id!: string

    @column()
    public name!: string

    @column()
    public slug!: string

    @column()
    public dbHost!: string

    @column()
    public dbPort!: number

    @column()
    public dbName!: string

    @column()
    public dbUser!: string

    @column()
    public dbPassword!: string

    @column()
    public status!: string
}

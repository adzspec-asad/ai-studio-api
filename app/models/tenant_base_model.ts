import { BaseModel } from '@adonisjs/lucid/orm'

export default class TenantBaseModel extends BaseModel {
  public static connection = 'tenant'
}

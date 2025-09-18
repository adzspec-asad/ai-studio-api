import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class SystemUserModel extends AuthFinder(BaseModel) {
  @column({ isPrimary: true })
  public id!: string

  @column()
  public email!: string

  @column()
  public name!: string

  @column({ serializeAs: null })
  public password!: string

  @column()
  public role!: 'superadmin' | 'admin' | 'support'

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  // Property to hold the current access token during authentication
  public currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(SystemUserModel)
}

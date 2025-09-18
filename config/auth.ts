import { defineConfig } from '@adonisjs/auth'
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'
import type { InferAuthenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'system_user',
  guards: {
    'system_user': tokensGuard({
      provider: tokensUserProvider({
        tokens: 'accessTokens',
        model: () => import('#models/system_user_model'),
      }),
    }),
  },
})

export default authConfig

/**
 * Inferring types for the list of authenticators you have configured
 * in your application.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}

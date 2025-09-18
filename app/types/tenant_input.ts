/**
 * Interface representing input data for creating/updating a tenant
 */
interface TenantInput {
  /** Unique ID */
  id?: string
  /** The display name of the tenant */
  name?: string
  /** URL-friendly unique identifier */
  slug?: string
  /** Database host address */
  dbHost?: string
  /** Database port number */
  dbPort?: number
  /** Database username */
  dbUser?: string
  /** Database password */
  dbPassword?: string
  /** Database name */
  dbName?: string
  /** Optional status flag */
  status?: 'active' | 'inactive'
}
export default TenantInput
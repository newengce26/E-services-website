export type Bindings = {
  DB: D1Database
  RECEIPTS: R2Bucket
  JWT_SECRET?: string
}

export type AdminRole = 'super_admin' | 'manager' | 'support'

export interface CustomerJwtPayload {
  type: 'customer'
  id: number
  email: string
  name: string
}

export interface AdminJwtPayload {
  type: 'admin'
  id: number
  email: string
  name: string
  role: AdminRole
}

export const MEMBERSHIP_API_URL = process.env.MEMBERSHIP_API_URL

function castBool (value, defaultValue) {
  value = value && value.trim()
  if (value === undefined || value === '') return Boolean(defaultValue)
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  throw new Error('castBool unexpected value: ' + value)
}

function useAuth () {
  return castBool(process.env.USE_AUTH, true)
}

export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN
export const USE_AUTH = useAuth()

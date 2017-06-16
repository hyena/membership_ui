import { MEMBERSHIP_API_URL } from '../config'
import api from './api'

export async function membershipApi (method, route, params = null) {
  return api(MEMBERSHIP_API_URL, method, route, params)
}

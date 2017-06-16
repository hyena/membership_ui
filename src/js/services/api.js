import request from 'superagent'
import { USE_AUTH } from '../config'

import {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT,
  HTTP_DELETE
} from '../util/util'
import { getAdminCredentials } from '../redux/actions/authActions' // eslint-disable-line no-unused-vars
import { AUTH_STORE } from '../redux/reducers/auth'
import { serviceLocator } from '../util/serviceLocator'

export default async function api (baseUrl, method, route, params = null) {
  let apiRequest
  const url = `${baseUrl}${route}`

  switch (method) {
    case HTTP_GET:
      apiRequest = request.get(url)
      if (params !== null) {
        apiRequest.query(params)
      }
      break

    case HTTP_POST:
      apiRequest = request.post(url)
      if (params !== null) {
        apiRequest.send(params)
      }
      break

    case HTTP_PUT:
      apiRequest = request.put(url)
      if (params !== null) {
        apiRequest.send(params)
      }
      break

    case HTTP_DELETE:
      apiRequest = request.delete(url)
      if (params !== null) {
        apiRequest.send(params)
      }
      break

    default:
      console.error(`Unexpected method type to api call: ${method}`)
      break
  }

  if (USE_AUTH) {
    addAuthHeaders(apiRequest)
  }

  try {
    const result = await apiRequest
    return result.body
  } catch (err) {
    throw err
  }
}

// Add basic auth headers to API request based on redux store
function addAuthHeaders (apiRequest) {
  let authStore = serviceLocator.store.getState()[AUTH_STORE]
  const token = authStore.get('token')
  if (token) {
    apiRequest.set('Authorization', `Bearer ${token}`)
  }
}

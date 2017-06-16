import {Map, fromJS} from 'immutable'

export const AUTH_STORE = 'auth'

import {
  LOCK_INIT,
  SHOW_LOCK,
  LOCK_SUCCESS,
  LOCK_ERROR,
  LOGOUT
} from '../../util/util'

export const INITIAL_AUTH_STATE = Map({
  authenticating: false,
  user: null,
  token: null,
  isAuthenticated: false,
  error: null
})

// TODO: LOCK_EXPIRE

export default function auth (state = INITIAL_AUTH_STATE, action) {
  switch (action.type) {
    case LOCK_INIT:
      return state
        .set('user', action.user)
        .set('token', action.token)
        .set('isAuthenticated', !!(action.user && action.token))

    case SHOW_LOCK:
      return state
        .set('authenticating', true)

    case LOCK_SUCCESS:
      return state
        .set('authenticating', false)
        .set('user', fromJS(action.user))
        .set('token', action.token)
        .set('isAuthenticated', true)

    case LOCK_ERROR:
      return state
        .set('authenticating', false)
        .set('user', null)
        .set('token', null)
        .set('error', action.error)

    case LOGOUT:
      return state
        .set('authenticating', false)
        .set('isAuthenticated', false)
        .set('user', null)
        .set('token', null)

    default:
      return state
  }
}

import merge from 'lodash/merge'
import {
  SHOW_LOCK,
  LOCK_SUCCESS,
  LOCK_ERROR,
  LOGOUT,
  LOCK_INIT,
  HIDE_LOCK
} from '../../util/util'
import {USE_AUTH, AUTH0_CLIENT_ID, AUTH0_DOMAIN} from '../../config'
import {push} from 'react-router-redux'
import Auth0Lock from 'auth0-lock'

const lockOptions = {
  auth: {
    params: {
      scope: 'openid email authorization'
    },
    responseType: 'token',
    redirectUrl: `${window.location.origin}/process`
  },
  avatar: null,
  theme: {
    logo: 'http://www.dsasf.org/images/dsa-logo.png',
    primaryColor: '#ED3124'
  },
  languageDictionary: {
    title: 'DSA'
  }
}

function setUser (user) {
  if (user == null) return
  localStorage.setItem('user', JSON.stringify(user))
}

function setToken (token) {
  if (token == null) return
  localStorage.setItem('id_token', token)
}

function getUser () {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch (_) {
    // NOOP
  }
}

function getToken () {
  return localStorage.getItem('id_token')
}

function lockInit () {
  const user = getUser()
  const token = getToken()

  return {
    type: LOCK_INIT,
    user,
    token
  }
}

function showLock () {
  return {
    type: SHOW_LOCK
  }
}

function hideLock () {
  return {
    type: HIDE_LOCK
  }
}

function lockSuccess (user, token) {
  setUser(user)
  setToken(token)
  return {
    type: LOCK_SUCCESS,
    user,
    token
  }
}

function lockError (error) {
  return {
    type: LOCK_ERROR,
    error
  }
}

function encodeStateParam (obj) {
  return btoa(JSON.stringify(obj))
}

function decodeStateParam (value) {
  return JSON.parse(atob(value))
}

let lock

export function login () {
  return (dispatch, getState) => {
    if (!lock) {
      initAuth()(dispatch, getState)
    }
    dispatch(showLock())
    // Redirect parameter https://github.com/mjrussell/redux-auth-wrapper
    const redirect = getState().routing.locationBeforeTransitions.query.redirect || '/'

    // Store redirect path in oauth state parameter
    // https://auth0.com/docs/tutorials/redirecting-users#using-the-state-parameter
    const state = {redirect}
    const options = merge({
      auth: {
        params: {state: encodeStateParam(state)}
      }
    }, lockOptions)
    lock.show(options)
  }
}

export function logout () {
  return (dispatch) => {
    dispatch({type: LOGOUT})
    localStorage.removeItem('id_token')
    localStorage.removeItem('user')
    window.location.replace(`http://${AUTH0_DOMAIN}/v2/logout?returnTo=${window.location.origin}&client_id=${AUTH0_CLIENT_ID}`)
  }
}

export function initAuth () {
  // TODO: Handle token expry
  return (dispatch, getState) => {
    if (!USE_AUTH || lock) return
    dispatch(lockInit())
    lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, lockOptions)
    handleAuthenticated(dispatch)
    handleError(dispatch)
    handleHide(dispatch, getState)
  }
}

function handleAuthenticated (dispatch) {
  // accessToken, idToken, state, refreshToken, idTokenPayload
  lock.on('authenticated', (response) => {
    const {accessToken, idToken, state} = response
    lock.getUserInfo(accessToken, (error, user) => {
      if (error) return dispatch(lockError(error))

      if (!user || !idToken) {
        return dispatch(lockError('Missing user or idToken'))
      }

      setUser(user)
      setToken(idToken)

      let redirect
      if (state) {
        try {
          const parsedState = decodeStateParam(state)
          redirect = parsedState.redirect
        } catch (_) {
          // NOOP
        }
      }

      dispatch(lockSuccess(user, idToken))
      if (redirect) dispatch(push(redirect))
    })
  })
}

function handleError (dispatch) {
  lock.on('authorization_error', (error) => {
    dispatch(lockError(error))
    lock.show({
      flashMessage: {
        type: 'error',
        text: error.error_description
      }
    })
  })
}

function handleHide (dispatch, getState) {
  lock.on('hide', () => {
    dispatch(hideLock())
    dispatch(push('/'))
  })
}

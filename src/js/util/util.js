import _get from 'lodash/get'

import { serviceLocator } from './serviceLocator'

export const HTTP_GET = 'GET'
export const HTTP_POST = 'POST'
export const HTTP_PUT = 'PUT'
export const HTTP_DELETE = 'DELETE'

export const SHOW_LOCK = 'SHOW_LOCK'
export const LOCK_SUCCESS = 'LOCK_SUCCESS'
export const LOCK_ERROR = 'LOCK_ERROR'
export const LOGOUT = 'LOGOUT'
export const LOCK_INIT = 'LOCK_INIT'
export const HIDE_LOCK = 'HIDE_LOCK'

export function logError (title, err = new Error(title)) {
  const errorMessage = _get(err, ['response', 'body', 'err'], err.toString())
  serviceLocator.notificationSystem.addNotification({
    title,
    message: errorMessage,
    level: 'error'
  })
}

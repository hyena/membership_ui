import { fromJS, Map } from 'immutable'

import { adminApi } from '../../services/membership'
import { HTTP_GET, logError } from '../../util/util'

export const FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST'
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS'
export const FETCH_DATA_ERROR = 'FETCH_DATA_ERROR'
export const SET_DATA = 'SET_DATA'

// Generic fetch data action that can be used to fetch data from an API &
// dispatch generic actions handled by the fetchDataHandler higher-order reducer
export function fetchData (
  {
    apiService = adminApi,
    method = HTTP_GET,
    route = '/',
    paramsOverride = false,
    store = '',
    keyPath = [],
    responseParser = (response) => fromJS(response)
  } =
  {}) {
  return async (dispatch, getState) => {
    dispatch(fetchDataRequest(store, keyPath))
    try {
      let params
      if (paramsOverride !== false) {
        params = paramsOverride
      } else {
        params = getState()[store].getIn(keyPath.concat('params'), Map()).toJS()
      }
      const response = await apiService(method, route, params)
      const data = responseParser(response)
      dispatch(fetchDataSuccess(store, keyPath, data))
    } catch (err) {
      dispatch(fetchDataError(store, keyPath, err))
      logError(`Error fetching ${route}`, err)
    }
  }
}

// Action indicates we are fetching data from API
function fetchDataRequest (store, keyPath) {
  return {
    type: FETCH_DATA_REQUEST,
    store,
    keyPath
  }
}

// Action indicates we have retrieved data from API
function fetchDataSuccess (store, keyPath, data) {
  return {
    type: FETCH_DATA_SUCCESS,
    store,
    keyPath,
    data
  }
}

// Action logs error when fetching data from API
function fetchDataError (store, keyPath, err) {
  return {
    type: FETCH_DATA_ERROR,
    store,
    keyPath,
    err
  }
}

export function setData (store, keyPath, value) {
  return {
    type: SET_DATA,
    store,
    keyPath,
    value
  }
}

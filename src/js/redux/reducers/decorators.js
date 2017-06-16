import { Set } from 'immutable'

import {
  FETCH_DATA_REQUEST,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_ERROR,
  SET_DATA
} from '../actions/fetchDataActions'

const VALID_ACTIONS = Set([
  FETCH_DATA_REQUEST,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_ERROR,
  SET_DATA
])

// Higher order reducer for fetching data that populates store data for fetch data  API request
// where store contains Map with loading, data, & err properties
export function fetchDataHandler (reducer, store) {
  return (state, action) => {
    let nextState = state
    if (action.store === store && VALID_ACTIONS.includes(action.type)) {
      const keyPath = action.keyPath
      const loadingKeyPath = action.keyPath.concat('loading')

      switch (action.type) {
        case FETCH_DATA_REQUEST:
          nextState = nextState.setIn(loadingKeyPath, true)
          break

        case FETCH_DATA_SUCCESS:
          nextState = nextState
            .setIn(loadingKeyPath, false)
            .setIn(keyPath.concat('data'), action.data)
            .setIn(keyPath.concat('err'), null)
          break

        case FETCH_DATA_ERROR:
          nextState = nextState
            .setIn(loadingKeyPath, false)
            .setIn(keyPath.concat('err'), action.err)
          break

        case SET_DATA:
          return state.setIn(action.keyPath, action.value)
      }
    }
    return reducer(nextState, action)
  }
}

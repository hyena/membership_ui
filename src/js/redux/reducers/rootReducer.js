import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import auth from './auth'
import member from './member'

const rootReducer = combineReducers({
  auth,
  member,
  routing: routerReducer
})

export default rootReducer

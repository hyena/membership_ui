import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'

import rootReducer from '../reducers/rootReducer'

const enhancer = compose(
  applyMiddleware(
    thunk,
    routerMiddleware(browserHistory)
  ),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)

export default function configureStore (initialState) {
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}

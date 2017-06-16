import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import configureStore from './redux/store/configureStore'
import { serviceLocator } from './util/serviceLocator'
import Root from './Root.jsx'
import './styling/styles'

const store = configureStore()
serviceLocator.store = store
const history = syncHistoryWithStore(browserHistory, store)
const rootElement = document.getElementById('root')

ReactDOM.render(
  <AppContainer>
    <Root
      store={store}
      history={history}
    />
  </AppContainer>,
  rootElement
)

if (module.hot) {
  module.hot.accept('./Root.jsx', () => {
    const RootContainer = require('./Root.jsx').default
    ReactDOM.render(
      <AppContainer>
        <RootContainer
          store={store}
          history={history}
        />
      </AppContainer>,
      rootElement
    )
  })
}

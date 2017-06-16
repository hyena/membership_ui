import React, { Component } from 'react'
import { connect, Provider } from 'react-redux'
import { initAuth } from './redux/actions/authActions'

import Routes from './Routes.jsx'

class Root extends Component {

  constructor (props) {
    super(props)
    this.props.initAuth()
  }

  render () {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <Routes history={history} />
      </Provider>
    )
  }
}

const mapStateToProps = (state) => state
const mapDispatchToProps = (dispatch) => ({
  initAuth: () => dispatch(initAuth())
})

export default connect(mapStateToProps, mapDispatchToProps)(Root)

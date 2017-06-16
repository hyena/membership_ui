import React, { Component } from 'react'
import { connect } from 'react-redux'

class UserView extends Component {

  render () {
    const user = this.props.auth.getIn(['user', 'nickname'], '')
    return (
      <div className="user-view">
        <span className="user-name">{user}</span>
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
      auth: state.auth
    }
  }
)(UserView)

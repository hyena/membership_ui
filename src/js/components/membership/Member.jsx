import React, { Component } from 'react'
import { connect } from 'react-redux'

class Member extends Component {

  constructor (props) {
    super(props)
    this.state = {
      member: {},
      inSubmission: false
    }
  }

  render () {
    const roles = []
    const memberData = this.props.member.getIn(['user', 'data'], null)
    if (memberData === null) {
      return (<div></div>)
    }
    memberData.get('roles').forEach((role, index) => {
      roles.push(
        <div>{`${role.get('role')}: ${role.get('committee')}`}</div>
      )
    })
    return (
      <div>
        <h2>Member Info</h2>
        <div>{`${memberData.getIn(['info', 'first_name'])} ${memberData.getIn(['info', 'last_name'])}`}</div>
        <h2>Committees</h2>
        {roles}
      </div>
    )
  }

}

export default connect((state) => state)(Member)

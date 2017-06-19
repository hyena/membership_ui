import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Navbar,
  Nav,
  NavItem
} from 'react-bootstrap'
import { fetchMember } from '../../redux/actions/memberActions'
import { LinkContainer } from 'react-router-bootstrap'
import styles from './styles.scss'

import UserView from './UserView.jsx'

class Navigation extends Component {

  componentDidMount () {
    this.props.fetchMember()
  }

  componentWillReceiveProps (nextProps) {
    const authUser = nextProps.auth.get('user', null)
    if (authUser === null) {
      return
    }
    const dbMember = nextProps.member.getIn(['user', 'data'], null)
    if ((dbMember === null || dbMember.get('email_address') !== authUser.email) &&
      (!nextProps.member.getIn(['user', 'loading']) && nextProps.member.getIn(['user', 'error']) === null)) {
      this.props.fetchMember()
    }
  }

  render () {
    let admin = false
    const memberData = this.props.member.getIn(['user', 'data'], null)
    if (memberData !== null) {
      memberData.get('roles').forEach((role) => {
        if (role.get('role') === 'admin' && role.get('committee') === 'general') {
          admin = true
        }
      })
    }
    console.log(styles)
    return (
      <Navbar fixedTop fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <div className="logo"></div>
          </Navbar.Brand>
        </Navbar.Header>

        <Nav styleName="app-nav">

          <LinkContainer to="/members">
            <NavItem eventKey="members">Member</NavItem>
          </LinkContainer>
          <LinkContainer to="/committees">
          <NavItem eventKey="committees">Committees</NavItem>
        </LinkContainer>
          <LinkContainer to="/elections">
            <NavItem eventKey="elections">Elections</NavItem>
          </LinkContainer>
          { admin &&
            <LinkContainer to="/admin">
              <NavItem eventKey="admin">Admin</NavItem>
            </LinkContainer>
          }

        </Nav>

        <Nav pullRight className="right-nav">
          <NavItem className="profile" eventKey="me">
            <UserView />
          </NavItem>
          <LinkContainer to="/logout">
            <NavItem className="logout" eventKey="logout">Logout</NavItem>
          </LinkContainer>
        </Nav>

      </Navbar>
    )
  }
}

export default connect(
  state => ({
    auth: state.auth,
    member: state.member
  }),
  dispatch => bindActionCreators({
    fetchMember
  }, dispatch)
  )(Navigation)

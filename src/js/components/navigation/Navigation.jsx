import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Navbar,
  Nav,
  NavItem
} from 'react-bootstrap'
import { fetchMember } from '../../redux/actions/memberActions'
import { LinkContainer } from 'react-router-bootstrap'

import UserView from './UserView.jsx'

class Navigation extends Component {

  componentDidMount () {
    this.props.dispatch(fetchMember())
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
    return (
      <Navbar fluid className="navigation">
        <Navbar.Header>
          <Navbar.Brand>
            <div className="logo"></div>
          </Navbar.Brand>
        </Navbar.Header>

        <Nav className="left-nav">

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

export default connect((state) => state)(Navigation)

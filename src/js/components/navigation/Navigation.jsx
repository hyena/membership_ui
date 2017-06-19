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
import _ from 'lodash'
import UserView from './UserView.jsx'

const navMap = [
  {
    link: '/members',
    label: 'Member'
  },
  {
    link: '/committees',
    label: 'Committees'
  },
  {
    link: '/elections',
    label: 'Elections'
  }
]

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

    return (
      <Navbar className="mainNav" fixedTop fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <div className="logo"></div>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {
              _.map(navMap, nav => (
                  <LinkContainer to={nav.link} key={nav.label}>
                    <NavItem className="dsaNavItem">{nav.label}</NavItem>
                  </LinkContainer>
              ))
            }
            { admin &&
              <LinkContainer to="/admin">
                <NavItem>Admin</NavItem>
              </LinkContainer>
            }

          </Nav>

          <Nav pullRight className="right-nav">
            <NavItem className="profile">
              <UserView />
            </NavItem>
            <LinkContainer to="/logout">
              <NavItem className="logout">Logout</NavItem>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default connect(
  state => state,
  dispatch => bindActionCreators({
    fetchMember
  }, dispatch)
  )(Navigation)

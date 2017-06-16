import React, { Component } from 'react'
import { Router, Route, IndexRedirect } from 'react-router'
import {routerActions} from 'react-router-redux'
import {connect} from 'react-redux'
import {login, logout} from './redux/actions/authActions'

import App from './components/App'
import MemberList from './components/admin/MemberList'
import Member from './components/membership/Member'
import Committees from './components/committee/Committees'
import Elections from './components/election/Elections'
import ElectionDetail from './components/election/ElectionDetail'
import Vote from './components/election/Vote'
import NotFound from './components/common/NotFound'

import { USE_AUTH } from './config'
import {UserAuthWrapper} from 'redux-auth-wrapper'

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth.get('user'),
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated',
  predicate: (user) => USE_AUTH ? user : true
})

const Authenticated = UserIsAuthenticated((props) => props.children)

class Routes extends Component {

  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <Router history={this.props.history}>
        <Route path="/" component={App}>
          <IndexRedirect to="members" />
          <Route path="process" />
          <Route path="login" onEnter={() => this.props.login()} />
          <Route path="logout" onEnter={() => this.props.logout()} />

          <Route component={Authenticated}>
            <Route path="members" component={Member} />
            <Route path="members/:memberId" component={Member} />
            <Route path="committees" component={Committees} />
            <Route path="admin" component={MemberList} />
            <Route path="elections" component={Elections} />
            <Route path="elections/:electionId" component={ElectionDetail} />
            <Route path="vote/:electionId" component={Vote} />
          </Route>
          <Route path="*" component={NotFound}/>
        </Route>
      </Router>
    )
  }
}

const mapStateToProps = (state) => state
const mapDispatchToProps = (dispatch) => ({
  login: () => dispatch(login()),
  logout: () => dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Routes)

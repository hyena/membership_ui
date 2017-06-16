import React, { Component } from 'react'
import { Grid } from 'react-bootstrap'
import NotificationSystem from 'react-notification-system'

import Navigation from './navigation/Navigation.jsx'
import { serviceLocator } from '../util/serviceLocator'

export default class App extends Component {

  componentDidMount () {
    serviceLocator.notificationSystem = this.refs.notificationSystem
  }

  render () {
    return (
      <div className="app-container">
        <div className="nav-container">
          <Navigation />
        </div>

        <div className="content-container">
          <Grid fluid className="content">
            { this.props.children }
          </Grid>
        </div>

        <NotificationSystem ref="notificationSystem" />
      </div>

    )
  }
}

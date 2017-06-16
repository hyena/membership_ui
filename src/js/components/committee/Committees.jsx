import React, { Component } from 'react'
import { connect } from 'react-redux'
import { membershipApi } from '../../services/membership'
import FieldGroup from '../common/FieldGroup'
import {
  HTTP_GET,
  HTTP_POST,
  logError
} from '../../util/util'
import {
  Button,
  Col,
  Form
} from 'react-bootstrap'
import { Map } from 'immutable'

class Committees extends Component {

  constructor (props) {
    super(props)
    this.state = {
      committees: [],
      committee: {name: '', admin_list: ''},
      inSubmission: false
    }
  }

  componentDidMount () {
    this.getCommittees()
  }

  updateForm (name, formKey, value) {
    if (this.state.inSubmission) {
      return
    }
    let update = this.state[name]
    update[formKey] = value
    this.setState({[name]: update})
  }

  render () {
    const committees = []
    this.state.committees.forEach((committee, index) => {
      committees.push(
        <div key={`committee-${index}`}>{committee}</div>
      )
    })
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
      <div>
        <h2> Committees and Working Groups </h2>
        {committees}
        { admin &&
        <div>
          <Col sm={4}>
            <h2>Add Committee</h2>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FieldGroup
                formKey="name"
                type="text"
                label="Committee Name"
                value={this.state.committee.name}
                onFormValueChange={(formKey, value) => this.updateForm('committee', formKey, value)}
                required
              />
              <FieldGroup
                formKey="admin_list"
                type="text"
                label="Admin Emails (comma-separated)"
                value={this.state.committee.admin_list}
                onFormValueChange={(formKey, value) => this.updateForm('committee', formKey, value)}
                required
              />
              <Button type="submit" onClick={(e) => this.submitForm(e, 'committee', '/committee')}>Add Committee</Button>
            </Form>
          </Col>
        </div>
        }
      </div>
    )
  }

  async getCommittees () {
    try {
      const results = await membershipApi(HTTP_GET, `/committee/list`)
      this.setState({committees: Map(results)})
    } catch (err) {
      return logError('Error loading test', err)
    }
  }

  async submitForm (e, name, endpoint) {
    e.preventDefault()
    if (this.state.inSubmission) {
      return
    }
    this.setState({inSubmission: true})
    try {
      await membershipApi(HTTP_POST, endpoint, this.state[name])
      this.getCommittees()
    } catch (err) {
      return logError('Error loading test', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(Committees)

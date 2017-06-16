import React, { Component } from 'react'
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

export default class MemberList extends Component {

  constructor (props) {
    super(props)
    this.state = {
      members: [],
      committees: [],
      newMember: {first_name: '', last_name: '', email_address: ''},
      admin: {email_address: '', committee: ''},
      inSubmission: false
    }
  }

  componentDidMount () {
    this.getMemberList()
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
    const members = []
    this.state.members.forEach((member, index) => {
      members.push(
        <div key={`member-${index}`}>{`${member.name}: ${member.email}`}</div>
      )
    })
    return (
      <div>
        <h2> Membership List </h2>
        {members}
        <Col sm={4}>
          <h2>Add Member</h2>
          <Form horizontal onSubmit={(e) => e.preventDefault()}>
            <FieldGroup
              formKey="first_name"
              type="text"
              label="First Name"
              value={this.state.newMember.first_name}
              onFormValueChange={(formKey, value) => this.updateForm('newMember', formKey, value)}
              required
            />
            <FieldGroup
              formKey="last_name"
              type="text"
              label="Last Name"
              value={this.state.newMember.last_name}
              onFormValueChange={(formKey, value) => this.updateForm('newMember', formKey, value)}
              required
            />
            <FieldGroup
              formKey="email_address"
              type="text"
              label="Email"
              value={this.state.newMember.email_address}
              onFormValueChange={(formKey, value) => this.updateForm('newMember', formKey, value)}
              required
            />
            <Button type="submit" onClick={(e) => this.submitForm(e, 'newMember', '/member')}>Add Member</Button>
          </Form>
          <Form horizontal onSubmit={(e) => e.preventDefault()}>
            <h2> Make Admin</h2>
            <FieldGroup
              formKey="email_address"
              type="text"
              label="Email"
              value={this.state.admin.email_address}
              onFormValueChange={(formKey, value) => this.updateForm('admin', formKey, value)}
              required
            />
            <FieldGroup
              formKey="committee"
              componentClass="select"
              label="Committee"
              options={Map(this.state.committees).set(0, 'General')}
              optionMap
              value={this.state.admin.committee}
              onFormValueChange={(formKey, value) => this.updateForm('admin', formKey, value)}
              required
            />
            <Button type="submit" onClick={(e) => this.submitForm(e, 'admin', '/admin')}>Add Admin</Button>
          </Form>
        </Col>
      </div>
    )
  }

  async getMemberList () {
    try {
      const results = await membershipApi(HTTP_GET, `/member/list`)
      this.setState({members: results})
    } catch (err) {
      return logError('Error loading test', err)
    }
  }

  async getCommittees () {
    try {
      const results = await membershipApi(HTTP_GET, `/committee/list`)
      this.setState({committees: results})
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
      this.getMemberList()
    } catch (err) {
      return logError('Error loading test', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

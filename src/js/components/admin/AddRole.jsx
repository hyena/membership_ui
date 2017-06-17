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
  Form,
  Row
} from 'react-bootstrap'
import { fromJS, Map } from 'immutable'

export default class AddRole extends Component {

  constructor (props) {
    super(props)
    this.state = {
      committees: Map(),
      newRole: Map({member_id: this.props.memberId, committee_id: '0', role:'member'}),
      inSubmission: false
    }
  }

  componentDidMount () {
    //TODO(jesse): hide the form behind an edit button to save bandwith for admins
    this.getCommittees()
  }

  updateForm (name, formKey, value) {
    if (this.state.inSubmission) {
      return
    }
    const update = this.state[name].set(formKey, value)
    this.setState({[name]: update})
  }

  render () {
    if (!this.props.admin) {
      return (<div></div>)
    }
    return (
      <div>
        <Row>
          <Col sm={4}>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <h2>Add Role</h2>
              <FieldGroup
                formKey="role"
                componentClass="select"
                options={['admin','member']}
                label="Role"
                value={this.state.newRole.get('role')}
                onFormValueChange={(formKey, value) => this.updateForm('newRole', formKey, value)}
                required
              />
              <FieldGroup
                formKey="committee_id"
                componentClass="select"
                label="Committee"
                options={this.state.committees.set(0, 'General')}
                optionMap
                value={this.state.newRole.get('committee_id')}
                onFormValueChange={(formKey, value) => this.updateForm('newRole', formKey, value)}
                required
              />
              <Button type="submit" onClick={(e) => this.submitForm(e, 'newRole', '/member/role')}>Add Role</Button>
            </Form>
          </Col>
        </Row>
      </div>
    )
  }

  async getCommittees () {
    try {
      const results = await membershipApi(HTTP_GET, `/committee/list`)
      this.setState({committees: fromJS(results)})
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
      this.props.refresh()
    } catch (err) {
      return logError('Error loading test', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}
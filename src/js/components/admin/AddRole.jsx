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

export default class AddMeeting extends Component {

  constructor (props) {
    super(props)
    this.state = {
      meetings: Map(),
      attendee: Map({member_id: this.props.memberId, meeting_id: ''}),
      inSubmission: false
    }
  }

  componentDidMount () {
    //TODO(jesse): hide the form behind an edit button to save bandwith for admins
    this.getMeetings()
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
              <h2>Add Meeting Attendance</h2>
              <FieldGroup
                formKey="meeting_id"
                componentClass="select"
                label="Meeting"
                options={this.state.meetings}
                optionMap
                value={this.state.attendee.get('meeting_id')}
                onFormValueChange={(formKey, value) => this.updateForm('attendee', formKey, value)}
                required
              />
              <Button type="submit" onClick={(e) => this.submitForm(e, 'attendee', '/member/attendee')}>Add Role</Button>
            </Form>
          </Col>
        </Row>
      </div>
    )
  }

  async getMeetings () {
    try {
      const results = await membershipApi(HTTP_GET, `/meeting/list`)
      this.setState({meetings: fromJS(results)})
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
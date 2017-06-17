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

export default class AddEligibleVoter extends Component {

  constructor (props) {
    super(props)
    this.state = {
      elections: Map(),
      eligibleVoter: Map({member_id: this.props.memberId, election_id: ''}),
      inSubmission: false
    }
  }

  componentDidMount () {
    //TODO(jesse): hide the form behind an edit button to save bandwith for admins
    this.getElections()
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
              <h2>Add EligibleVoter</h2>
              <FieldGroup
                formKey="election_id"
                componentClass="select"
                label="Election"
                options={this.state.elections}
                placeHolder="Select an election"
                optionMap
                value={this.state.eligibleVoter.get('election_id')}
                onFormValueChange={(formKey, value) => this.updateForm('eligibleVoter', formKey, value)}
                required
              />
              <Button type="submit" onClick={(e) => this.submitForm(e, 'eligibleVoter', '/election/voter')}>Add Voter</Button>
            </Form>
          </Col>
        </Row>
      </div>
    )
  }

  async getElections () {
    try {
      const results = await membershipApi(HTTP_GET, `/election/list`)
      this.setState({elections: fromJS(results)})
    } catch (err) {
      return logError('Error loading election', err)
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
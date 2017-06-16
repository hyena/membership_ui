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
import { fromJS, Map, List } from 'immutable'

class ElectionDetail extends Component {

  constructor (props) {
    super(props)
    this.state = {
      election: Map({name: '', candidates: List(), number_winners: 1, 'votes_cast': 0}),
      inSubmission: false
    }
  }

  componentDidMount () {
    this.getElectionDetails()
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
    let admin = false
    const memberData = this.props.member.getIn(['user', 'data'], null)
    if (memberData !== null) {
      memberData.get('roles').forEach((role) => {
        if (role.get('role') === 'admin' && role.get('committee') === 'general') {
          admin = true
        }
      })
    }
    const candidates = []
    this.state.election.get('candidates').forEach((candidate, index) => {
      candidates.push(<div key={`candidate-${index}`}>{candidate.get('name')}</div>)
    })
    return (
      <div>
        <h2> Election </h2>
        <h3> {this.state.election.get('name')} </h3>
        <h3>Number of positions {this.state.election.get('number_winners')} </h3>
        <h3>Votes cast {this.state.election.get('votes_cast')} </h3>
        {candidates}
        { admin &&
        <div>
          <Col sm={4}>
            <h2>Add Election</h2>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FieldGroup
                formKey="name"
                type="text"
                label="Election Name"
                value={this.state.election.name}
                onFormValueChange={(formKey, value) => this.updateForm('election', formKey, value)}
                required
              />
              <FieldGroup
                formKey="number_winners"
                type="number"
                step="1"
                min="1"
                label="Number of winners"
                value={this.state.election.number_winners}
                onFormValueChange={(formKey, value) => this.updateForm('election', formKey, value)}
                required
              />
              <FieldGroup
                formKey="candidate_list"
                type="text"
                label="Candidate Emails (comma-separated)"
                value={this.state.election.candidate_list}
                onFormValueChange={(formKey, value) => this.updateForm('election', formKey, value)}
                required
              />
              <Button type="submit" onClick={(e) => this.submitForm(e, 'election', '/election')}>Add Election</Button>
            </Form>
          </Col>
        </div>
        }
      </div>
    )
  }

  async getElectionDetails () {
    try {
      const results = await membershipApi(HTTP_GET, `/election`, {id: this.props.params.electionId})
      this.setState({election: fromJS(results)})
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
      this.getElections()
    } catch (err) {
      return logError('Error loading test', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(ElectionDetail)

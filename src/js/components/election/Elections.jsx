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
import { Link } from 'react-router'

class Elections extends Component {

  constructor (props) {
    super(props)
    this.state = {
      elections: [],
      election: {name: '', candidate_list: '', number_winners: '1'},
      inSubmission: false
    }
  }

  componentDidMount () {
    this.getElections()
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
    const elections = []
    this.state.elections.forEach((electionName, id) => {
      elections.push(
        <div key={`election-toolbox-${id}`} className="election-toolbox">
          <label htmlFor={`election-${id}`}>
            <input type="checkbox" id={`election-${id}`}/>
            <span>{electionName}</span>
            <Link key={`print-ballots-${id}`} to={`/elections/${id}/print`}>Print Ballots</Link>
            <Link key={`edit-details-${id}`} to={`/elections/${id}/`}>Details</Link>
          </label>
        </div>
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
        <h2> Elections </h2>
        {elections}
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

  async getElections () {
    try {
      const results = await membershipApi(HTTP_GET, `/election/list`)
      this.setState({elections: Map(results)})
    } catch (err) {
      return logError('Error loading /election/list', err)
    }
  }

  async submitForm (e, name, endpoint) {
    e.preventDefault()
    if (this.state.inSubmission) {
      return Promise()
    }
    this.setState({inSubmission: true})
    try {
      await membershipApi(HTTP_POST, endpoint, this.state[name])
      this.getElections()
    } catch (err) {
      return logError('Error creating election', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(Elections)

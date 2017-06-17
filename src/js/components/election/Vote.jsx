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
  Label
} from 'react-bootstrap'
import { fromJS, Map, List } from 'immutable'

class Vote extends Component {

  constructor (props) {
    super(props)
    this.state = {
      election: Map({name: '', number_winners: 1}),
      unranked: List(),
      ranked: List(),
      inSubmission: false,
      dragging: null,
      result: null
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

  drop (event, list, index) {
    console.log('Dropping')
    event.preventDefault()
    event.stopPropagation()
    const newState = {'ranked': this.state.ranked, 'unranked': this.state.unranked}
    const dragging = this.state.dragging
    if (list === dragging.list && dragging.index < index) {
      index = index - 1
    }
    const dragged = newState[dragging.list].get(dragging.index)
    newState[dragging.list] = newState[dragging.list].delete(dragging.index)
    newState[list] = newState[list].insert(index, dragged)
    newState['dragging'] = null
    this.setState(newState)
  }

  allowDrop (event) {
    event.preventDefault()
  }

  highlight () {

  }
  unhighlight () {

  }
  dragStart (list, index) {
    console.log('Starting drag')
    this.setState({dragging: {list: list, index: index}})
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
    this.state.unranked.forEach((candidate, index) => {
      const candidateId = candidate.get('id')
      candidates.push(
        <div
          key={`candidate-${index}`}
            onDrop = {(event) => this.drop(event, 'unranked', index)}
            onDragOver={(event) => this.allowDrop(event)}
            onDragEnter={(event) => this.highlight()}
            onDragLeave={(event) => this.unhighlight()}
            draggable={this.state.result === null}
            onDragStart={(event) => this.dragStart('unranked', index)}
        >
          <Label>{candidate.get('name')}</Label>
        </div>)
    })
    const votes = []
    this.state.ranked.forEach((candidate, index) => {
      const candidateId = candidate.get('id')
      votes.push(
        <div
          key={`candidate-${index}`}
          onDrop = {(event) => this.drop(event, 'ranked', index)}
          onDragOver = {(event) => this.allowDrop(event)}
          onDragEnter = {(event) => this.highlight()}
          onDragLeave = {(event) => this.unhighlight()}
          draggable = {this.state.result === null}
          onDragStart = {(event) => this.dragStart('ranked', index)}
        >
          <Label>{candidate.get('name')}</Label>
        </div>)
    })
    return (
      <div className="membership">
        <h2> Election </h2>
        <h3> {this.state.election.get('name')} </h3>
        <h3>Number of positions {this.state.election.get('number_winners')} </h3>
        <div>
          <p> To vote drag the candidates from the box on the left to the box on the right and place
            them in the desired order. Press the vote button when finished. Currently this does not
            work on phones, but we are working on a solution.</p>
          <Col sm={4} className="voteBox"
               onDrop={(event) => this.drop(event, 'unranked', this.state.unranked.size)}
               onDragOver={(event) => this.allowDrop(event)}
          >
            <h2>Candidates</h2>
            {candidates}
          </Col>
          <Col sm={4}
               className="voteBox"
               onDrop={(event) => this.drop(event, 'ranked', this.state.ranked.size)}
               onDragOver={(event) => this.allowDrop(event)}
          >
            <h2>Ballot</h2>
            {votes}
          </Col>
          {this.state.result === null ?
            <Button type="submit" onClick={(e) => this.vote()}>VOTE</Button> :
            <p>Congratulations. You've successfully voted. Your confirmation number is
              <strong> {this.state.result.ballot_id}</strong>. Save this number if you'd like to
              confirm your vote was counted correctly after the election, but keep it private
              or everybody will be able to see how you voted.
            </p>
          }
        </div>
      </div>
    )
  }

  async getElectionDetails () {
    try {
      const results = await membershipApi(HTTP_GET, `/election`, {id: this.props.params.electionId})
      this.setState({
        election: Map({name: results.name, number_winners: results.number_winners}),
        unranked: fromJS(results.candidates)
      })
    } catch (err) {
      return logError('Error loading election', err)
    }
  }

  async vote () {
    if (!confirm("Are you sure you want to submit your vote now? This cannot be undone.")){
      return Promise()
    }
    if (this.state.inSubmission) {
      return Promise()
    }
    this.setState({inSubmission: true})
    const params = {
      election_id: this.props.params.electionId,
      rankings: this.state.ranked.map(c => c.get('id'))
    }
    try {
      const result = await membershipApi(HTTP_POST, '/vote', params)
      this.setState({result:result})
    } catch (err) {
      return logError('Error submitting vote', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(Vote)

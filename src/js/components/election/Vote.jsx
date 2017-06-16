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
      dragging: null
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
          onDrop={(event) => this.drop(event, 'unranked', index)}
          onDragOver={(event) => this.allowDrop(event)}
          onDragEnter={this.highlight()}
          onDragLeave={this.unhighlight()}
          draggable={true}
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
          onDrop={(event) => this.drop(event, 'ranked', index)}
          onDragOver={(event) => this.allowDrop(event)}
          onDragEnter={this.highlight()}
          onDragLeave={this.unhighlight()}
          draggable={true}
          onDragStart={(event) => this.dragStart('ranked', index)
          }
        >
          <Label>{candidate.get('name')}</Label>
        </div>)
    })
    return (
      <div className="membership">
        <h2> Election </h2>
        <h3> {this.state.election.get('name')} </h3>
        <h3>Number of positions {this.state.election.get('number_winners')} </h3>
        <h3>Votes cast {this.state.election.get('votes_cast')} </h3>
        <div>
          <Col sm={4} className="voteBox"
               onDrop={(event) => this.drop(event, 'unranked', this.state.unranked.size)}
               onDragOver={(event) => this.allowDrop(event)}
          >
            {candidates}
          </Col>
          <Col sm={4}
               className="voteBox"
               onDrop={(event) => this.drop(event, 'ranked', this.state.ranked.size)}
               onDragOver={(event) => this.allowDrop(event)}
          >
            {votes}
          </Col>
            <Button type="submit" onClick={(e) => this.vote()}>VOTE</Button>
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
    if (this.state.inSubmission) {
      return Promise()
    }
    this.setState({inSubmission: true})
    const params = {
      election_id: this.props.params.electionId,
      rankings: this.state.ranked.map(c => c.get('id'))
    }
    try {
      await membershipApi(HTTP_POST, '/vote', params)
    } catch (err) {
      return logError('Error submitting vote', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(Vote)

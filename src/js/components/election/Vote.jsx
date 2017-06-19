import React, {Component} from "react";
import {connect} from "react-redux";
import {membershipApi} from "../../services/membership";
import {HTTP_GET, HTTP_POST, logError} from "../../util/util";
import {Button, ButtonGroup, Col, Form, Label} from "react-bootstrap";
import _ from "lodash";
import {fromJS, Map, List} from "immutable";

class Vote extends Component {

  constructor (props) {
    super(props)
    this.state = {
      election: Map({name: '', number_winners: 1}),
      unranked: List(),
      ranked: List(),
      rankedSelected: null,
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

  selectRanked(rankedIdx) {
    if (this.state.rankedSelected !== null && this.state.rankedSelected !== rankedIdx) {
      // swap the ranked choices
      const candidateArray = this.state.ranked.toArray()
      const prevIdx = this.state.rankedSelected
      const candidateHighlighted = candidateArray[prevIdx]
      const candidateClicked = candidateArray[rankedIdx]
      candidateArray[prevIdx] = candidateClicked
      candidateArray[rankedIdx] = candidateHighlighted
      this.setState({
        ranked: List(candidateArray),
        rankedSelected: null
      })
    } else {
      this.setState({rankedSelected: rankedIdx})
    }
  }

  addToRanked(unrankedIdx) {
    const candidate = this.state.unranked.get(unrankedIdx)
    this.setState({
      unranked: this.state.unranked.remove(unrankedIdx),
      ranked: this.state.ranked.push(candidate)
    })
  }

  removeFromRanked(rankedIdx) {
    const candidate = this.state.ranked.get(rankedIdx)
    this.setState({
      unranked: this.state.unranked.push(candidate),
      ranked: this.state.ranked.remove(rankedIdx)
    })
  }

  render () {
    return this.renderForMobile()
  }

  renderForMobile () {
    const rankedCandidates = <ol className="ranked-candidates">
      {this.state.ranked.map((candidate, index) =>
        <li key={`ranked-${index}`}>
          <ButtonGroup justified bsSize="large">
            <a
              id={`swap-candidate-${candidate.get('id')}`}
              className={`btn btn-success${this.state.rankedSelected === index ? ' active hover' : ''}`}
              onClick={(e) => {
                this.selectRanked(index)
              }}
              >{candidate.get('name')}</a>
            <a
              className='btn btn-danger'
              id={`drop-candidate-${candidate.get('id')}`}
              onClick={(e) => {
                this.removeFromRanked(index)
              }}
            >Unrank</a>
          </ButtonGroup>
        </li>
      )}
    </ol>
    const unrankedCandidates = <ul className="unranked-candidates">
      {this.state.unranked.map((candidate, index) =>
        <li key={`unranked-${index}`}>
          <Button block bsSize="large" onClick={(e) => this.addToRanked(index)}>{candidate.get('name')}</Button>
        </li>
      )}
    </ul>
    return <div>
      <ul>
        <li>Click unranked candidates to add them in order</li>
        <li>Swap 2 ranked candidates by clicking on their names</li>
        <li>Rank as many as you wish</li>
      </ul>
      <Form onSubmit={(e) => e.stopPropagation()}>
        <div className="text-center"><strong>Ranked</strong></div>
        {rankedCandidates}
        <div className="text-center"><strong>Unranked</strong></div>
        {unrankedCandidates}
        {this.state.result === null ?
          <Button disabled={this.state.inSubmission} block bsSize="large" bsStyle="primary" onClick={(e) => this.vote()}>VOTE</Button> :
          <p>Congratulations. You've successfully voted. Your confirmation number is
            <strong> {this.state.result.ballot_id}</strong>. Save this number if you'd like to
            confirm your vote was counted correctly after the election, but keep it private
            or everybody will be able to see how you voted.
          </p>
        }
      </Form>
    </div>
  }

  renderWithDragAndDrop () {
    const candidates = []
    this.state.unranked.forEach((candidate, index) => {
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
        unranked: fromJS(_.shuffle(results.candidates))
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

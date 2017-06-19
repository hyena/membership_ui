import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, ButtonGroup, Form, FieldControl} from "react-bootstrap";
import FieldGroup from "../common/FieldGroup";
import PaperBallot from "./PaperBallot";
import {Sanitize} from "../../functional";
import {fromJS, List, Range, Map} from "immutable";
import {ballotKeySanitizer} from "./BallotModel";
import ElectionClient from "../../client/ElectionClient";

class EnterVote extends Component {

  static blankBallot (electionId, ballotKey) {
    return Map({
      election_id: electionId,
      ballot_key: ballotKey,
      rankings: List()
    })
  }

  constructor (props) {
    super(props)
    this.state = {
      ballotKeyInput: '',
      searchingForVote: false,
      existingVote: null,
      vote: null,
      sortedCandidates: null,
      submitMessage: null,
      election: Map({
        name: '',
        candidates: List(),
        candidatesById: Map()
      }),
      validation: EnterVote.initValidationMessage
    }
  }

  componentWillMount () {
    ElectionClient.getElection(this.props.params.electionId).then((result) => {
      const election = fromJS(result)
      const candidatesById = election.get('candidates', List()).toMap().mapEntries(([idx, c]) => [c.get('id'), c])
      this.setState({
        election: election.set('candidatesById', candidatesById)
      })
    })
    const ballotKey = ballotKeySanitizer.sanitize(this.state.ballotKeyInput)
    if (ballotKey) {
      this.searchForVote(ballotKey).then(() => {
        this.setState({vote: this.state.existingVote})
      })
    }
  }

  async searchForVote (ballotKey) {
    this.setState({searchingForVote: true})
    let existingVote = null
    try {
      const result = await ElectionClient.getVote(this.props.params.electionId, ballotKey)
      existingVote = fromJS(result)
    } finally {
      this.setState({
        existingVote: existingVote,
        searchingForVote: false,
        validation: existingVote
          ? null
          : Map({
            status: 'warning',
            message: <p><strong>{`Ballot #${ballotKey} is unclaimed.`}</strong>You must claim it before you can submit this vote</p>
          })
      })
    }
  }

  static sortRankings (rankings) {
    return rankings.entrySeq().sortBy(([cid, rank]) => rank).map(([cid, rank]) => cid)
  }

  async verifyOrSubmit (event) {
    if (this.state.existingVote && !this.state.existingVote.get('rankings', List()).isEmpty()) {
      this.verifyVote()
    } else {
      const ballotKey = this.state.vote.get('ballot_key')
      const resp = confirm(`Are you sure you want to submit ballot #${ballotKey}?`)
      if (resp) {
        const rankedCandidates = EnterVote.sortRankings(this.state.vote.get('rankings'))
        const voteBody = this.state.vote.set('rankings', rankedCandidates)
        await this.submitVoteAndReset(event, () => ElectionClient.submitPaperBallot(voteBody))
      }
    }
  }

  verifyVote () {
    const rankedCandidates = EnterVote.sortRankings(this.state.vote.get('rankings'))
    const existingRankedCandidates = this.state.existingVote.get('rankings')
    if (rankedCandidates.equals(existingRankedCandidates)) {
      this.setState({
        sortedCandidates: rankedCandidates,
        validation: Map({
          status: 'success',
          message: <p><strong>Vote matches previously submitted ballot!</strong></p>
        })
      })
    } else {
      this.setState({
        sortedCandidates: rankedCandidates,
        validation: Map({
          status: 'error',
          message: <p><strong>Vote does not match order from previously submitted ballot!</strong></p>
        })
      })
    }
  }

  render() {
    const ballot = !this.state.searchingForVote && this.state.vote && this.state.existingVote
      ? <PaperBallot
        editable={true}
        election={this.state.election}
        ballotKey={this.state.vote.get('ballot_key')}
        onRankingChange={(rankings) => {
          this.setState({
            vote: this.state.vote.set('rankings', rankings),
            validation: null
          })
        }}
      />
      : null

    let validationBox, overrideButton, validationTable = null
    if (this.state.validation) {
      // We have a validation box to show
      const status = this.state.validation.get('status')
      if (status === 'error') {
        const existingRankings = this.state.existingVote.get('rankings')
        const currentRankings = this.state.sortedCandidates
        const totalRange = Range(0, Math.max(existingRankings.size, currentRankings.size))
        validationTable = (
          <table>
            <thead>
              <tr>
                <th>Existing Ballot</th>
                <th>Current Ballot</th>
                <th>Matching?</th>
              </tr>
            </thead>
            <tbody>
              {totalRange.toSeq().map(i => {
                const existing = this.state.election.getIn(['candidatesById', existingRankings.get(i), 'name'])
                const current = this.state.election.getIn(['candidatesById', currentRankings.get(i), 'name'])
                return <tr key={`validation-rank-comparison-${i}`}>
                  <td>{existing}</td>
                  <td>{current}</td>
                  <td>{existing === current ? '√' : 'X'}</td>
                </tr>
              })}
            </tbody>
          </table>
        )
        // If we are displaying an error with the ballot, we have the option to override the ballot to submit the current one
        overrideButton = (
          <Button
            className="center-block"
            bsStyle="danger"
            onClick={(e) => {
              const ballotKey = this.state.vote.get('ballot_key')
              const resp = confirm(`Are you sure you want to overwrite ballot #${ballotKey}?`)
              if (resp) {
                const rankedCandidates = EnterVote.sortRankings(this.state.vote.get('rankings'))
                const voteBody = this.state.vote.set('rankings', rankedCandidates)
                this.submitVoteAndReset(e, () => ElectionClient.submitPaperBallot(voteBody, true)
                  .then(() => {
                      this.setState({
                        validation: Map({
                          status: 'success',
                          message: <p><strong>{`Ballot #${ballotKey} updated successfully!`}</strong></p>
                        })
                      })
                    }
                  ))
              }
            }}>
            Overwrite Ballot
          </Button>
        )
      }
      let validationClasses = ['validation-box', 'center-block', 'center-text', 'alert']
      switch (this.state.validation.get('status')) {
        case 'success':
          validationClasses.push('alert-success')
          break
        case 'info':
          validationClasses.push('alert-info')
          break
        case 'warning':
          validationClasses.push('alert-warning')
          break
        case 'error':
          validationClasses.push('alert-danger')
          break
        default:
      }
      validationBox = (
        <div className={validationClasses.join(' ')}>
          <span className="text-center">{this.state.validation.get('message')}</span>
          <div className="text-center">{validationTable}</div>
          {overrideButton}
        </div>
      )
    }

    return (
      <div>
        <h1>Enter Ballot for {this.state.election.get('name')}</h1>
        <Form onSubmit={(e) => e.preventDefault()}>
          <FieldGroup
            required
            id="searchBallotKey"
            ref={(input) => { this.searchInput = input; }}
            type="text"
            label="Ballot Key"
            maxLength="5"
            value={this.state.ballotKeyInput}
            onChange={(e) => {
              const searchBallotKey = ballotKeySanitizer.sanitize(e.target.value)
              const nextState = {
                validation: EnterVote.initValidationMessage
              }
              if (searchBallotKey) {
                this.searchForVote(searchBallotKey)
                nextState.ballotKeyInput = searchBallotKey
                nextState.vote = EnterVote.blankBallot(this.props.params.electionId, searchBallotKey)
              } else {
                const input = EnterVote.ballotKeyInputSanitizer.sanitize(e.target.value)
                // Don't allow unsanitary input
                if (input !== null) {
                  nextState.ballotKeyInput = input
                }
                nextState.vote = null
              }
              this.setState(nextState)
            }}
          />
          {validationBox}
          {ballot
            ? <div>
                {ballot}
                <Button
                  block
                  bsStyle="primary"
                  onClick={(e) => this.verifyOrSubmit(e)}
                >
                  {this.state.existingVote.get('rankings', List()).isEmpty()
                    ? 'Submit Vote'
                    : 'Verify Vote'
                  }
                </Button>
              </div>
            : null
          }
        </Form>
      </div>
    )
  }

  async submitVoteAndReset(e, call) {
    const result = await this.submitForm(e, call)
    await this.searchForVote(this.state.vote.get('ballot_key'))
    return result
  }

  async submitForm (e, call) {
    e.preventDefault()
    if (this.state.inSubmission) {
      return Promise()
    }
    this.setState({inSubmission: true})
    try {
      return await call()
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

EnterVote.initValidationMessage = Map({
  status: 'info',
  message: <p><strong>Enter a 5 digit ballot key to proceed.</strong></p>
})
EnterVote.ballotKeyInputSanitizer = Sanitize.pipeline(Sanitize.trimmed, Sanitize.postiveNum)

export default connect((state) => state)(EnterVote)

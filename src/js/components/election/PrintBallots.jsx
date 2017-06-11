import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  HTTP_GET,
  HTTP_POST,
  logError
} from '../../util/util'
import {
  Button,
  Form,
  FormControl
} from 'react-bootstrap'
import PaperBallot from './PaperBallot'
import { membershipApi } from '../../services/membership'
import { fromJS, List, Map } from 'immutable'

class PrintBallots extends Component {

  constructor (props) {
    super(props)
    this.state = {
      claimedBallots: List(),
      readyToPrint: false,
      claimAndPrintForm: {
        election_id: props.params.electionId,
        number_ballots: 0
      },
      election: Map({
        name: '',
        candidates: List()
      })
    }
  }

  componentWillMount () {
    this.getElection(this.props.params.electionId)
  }

  render () {
    const ballots = this.state.claimedBallots.map((ballotKey) =>
      <PaperBallot key={ballotKey} election={this.state.election} ballotKey={ballotKey}/>
    )
    return (
      <div>
        <div className="print-hidden">
          <h1>Print Ballots for {this.state.election.get('name')}</h1>
          <Form inline>
            <FormControl required
              id="number_ballots"
              type="text"
              maxLength="5"
              onChange={(e) => {
                let form = this.state.claimAndPrintForm
                form.number_ballots = parseInt(e.target.value, 10)
                this.setState({'claim_ballots': form})
              }}
              />
            ballots
            <Button type="submit"
              onClick={(e) => {
                this.submitForm(e, 'claimAndPrintForm', '/ballot/claim').then((ballotKeys) => {
                  this.setState({claimedBallots: fromJS(ballotKeys), readyToPrint: true})
                })
              }}>
              Claim and Print
            </Button>
          </Form>
        </div>
        <div id="paper-ballots">
          {ballots}
        </div>
      </div>
    )
  }

  componentDidUpdate () {
    if (this.state.readyToPrint) {
      this.setState({readyToPrint: false})
      window.print()
    }
  }

  async getElection (id) {
    try {
      const result = await membershipApi(HTTP_GET, `/election`, {'id': id})
      this.setState({election: fromJS(result)})
    } catch (err) {
      return logError(`Error loading election /election?id=${id}`, err)
    }
  }

  async submitForm (e, formName, endpoint) {
    e.preventDefault()
    if (this.state.inSubmission) {
      return
    }
    this.setState({inSubmission: true})
    try {
      return await membershipApi(HTTP_POST, endpoint, this.state[formName])
    } catch (err) {
      return logError(`Error submitting form to ${endpoint}`, err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(PrintBallots)
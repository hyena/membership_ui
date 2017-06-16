import React, { Component } from 'react'
import { connect } from 'react-redux'
import seedrandom from 'seedrandom'

class PaperBallot extends Component {

  render () {
    // TODO: Allow custom number of columns via props
    const columns = 2
    const candidates = this.props.election.get('candidates')
    const rng = seedrandom(this.props.election.get('id'))
    const shuffledCandidates = candidates.sortBy(rng)
    const candidateList = shuffledCandidates.map((candidate, idx) =>
      <li key={`candidate-${idx}`} className="candidate">
        <span className="rank-box"/>
        <span>{candidate.get('name')}</span>
      </li>
    )
    return (
      <div className="printPage">
        <h2> {this.props.election.get('name', 'Unnamed')} Election Ballot #{this.props.ballotKey} </h2>
        <ul className="candidateList" style={{columnCount: `${columns}`}}>
          {candidateList}
        </ul>
      </div>
    )
  }
}

export default connect((state) => state)(PaperBallot)

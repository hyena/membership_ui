import React, {Component} from "react";
import {connect} from "react-redux";
import {Form, FormControl} from "react-bootstrap";
import {Map} from "immutable";
import seedrandom from "seedrandom";
import _ from "lodash";

class PaperBallot extends Component {

  constructor(props) {
    super(props)
    this.state = {
      columns: this.props.columns,
      editable: !!props.editable,
      ranking: Map(),
      warnings: Map()
    }
    this.electionId = this.props.election.get('id')
    const candidates = this.props.election.get('candidates')
    const seed = this.electionId + '_' + String(this.props.ballotKey)
    const rng = seedrandom(seed)
    this.shuffledCandidates = candidates.sortBy(rng)
  }

  static validateBallot(ranking) {
    // Collect all candidates with the same rank
    // 1. Group candidate ids by rank on the form
    const candidateIdsByRank = ranking // : Map[str, str]
      .groupBy(rank => rank) // : Map[str, Map[str, str]]
      .map(ranking => ranking.keySeq()) // : Map[str, Seq[str]]
    // 2. Filter the candidate id groups that contain more than 1 candidate id with the same ranking
    // 3. flatten to a set of candidate ids that have errors
    return candidateIdsByRank
      .filter(cids => !cids.skip(1).isEmpty())
      .flatMap((cids, rank) => cids.map(cid => [cid, `Duplicate rank ${rank}`]))
  }

  render() {
    this.state.warningLegend = this.state.warnings.valueSeq().toSet()
    if (!this.props.editable) {
      const candidateList = this.shuffledCandidates.map((candidate, idx) => {
        const id = candidate.get('id')
        const rank = this.state.ranking.get(id, '') // either a number or empty string
        return <li key={`candidate-${idx}`} className="candidate">
          <span
            className={`rank-box ${this.state.warnings.has(id) ? 'warning' : ''}`}><label>{rank}</label></span>
          <span>{candidate.get('name')}</span>
        </li>
      })
      return (
        <div className="printPage">
          <h2> {this.props.election.get('name', 'Unnamed')} Election Ballot #{this.props.ballotKey} </h2>
          <ul className="candidateList" style={{columnCount: `${this.state.columns}`}}>
            {candidateList}
          </ul>
        </div>
      )
    } else {
      const candidateList = this.shuffledCandidates.map((candidate, idx) => {
        const id = candidate.get('id')
        const currentRank = '' + this.state.ranking.get(id, '') // either a number or empty string
        return <li key={`election-${this.electionId}_candidate-${idx}`} className="candidate">
          <span className={`rank-box ${this.state.warnings.has(id) ? 'warning' : ''}`}>
            <FormControl
              type="text"
              maxLength="5"
              onChange={(e) => {
                const newRank = e.target.value ? parseInt(e.target.value, 10) : null
                const updatedRank = newRank ? this.state.ranking.set(id, newRank) : this.state.ranking.delete(id)
                this.setState({
                  ranking: updatedRank,
                  warnings: PaperBallot.validateBallot(updatedRank)
                })
                if (_.isFunction(this.props.onRankingChange)) {
                  this.props.onRankingChange(updatedRank)
                }
              }}
              value={currentRank}
            />
          </span>
          <span>{candidate.get('name')}</span>
        </li>
      })
      return (
        <div>
          <h2> {this.props.election.get('name', 'Unnamed')} Election Ballot #{this.props.ballotKey} </h2>
          <ul className="candidateList" style={{columnCount: `${this.state.columns}`}}>
            {candidateList}
          </ul>
        </div>
      )
    }
  }
}

export default connect((state) => state)(PaperBallot)

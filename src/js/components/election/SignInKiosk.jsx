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
  Row,
} from 'react-bootstrap'
import { fromJS, Map, List } from 'immutable'
import _get from 'lodash/get'

class SignInKiosk extends Component {

  constructor (props) {
    super(props)
    this.state = {
      election: Map({name: '', candidates: List(), number_winners: 1}),
      lastResult:'',
      voters: Map(),
      memberId: '',
      searchString: '',
      inSubmission: false
    }
  }

  componentDidMount () {
    this.getElectionDetails()
    this.getVoterList()
  }

  updateSearch (value) {
    if (this.state.inSubmission) {
      return
    }
    this.setState({searchString: value, memberId: ''})
  }

  select(memberId){
    this.setState({memberId:memberId, searchString: this.state.voters.get(memberId)})
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
    if (!admin) {
      return (<div>This page is for admins only.</div>)
    }
    let options = null
    if (this.state.searchString.length > 2 && this.state.memberId === ''){
      const regex = new RegExp(this.state.searchString, "i")
      options = this.state.voters.filter((v) => v.match(regex))
        .map((v,k)=>(
          <Row key={k}>
            <Col smOffset={3} sm={9}>
            <Button onClick={(event)=>this.select(k)}>{v}</Button>
            </Col>
          </Row>
        )).valueSeq()
    }
    return (
      <div>
        <h2> Election </h2>
        <h3> {this.state.election.get('name')} </h3>
        <p>{this.state.lastResult}</p>
        <Col sm={6}>
          <Row>
            <FieldGroup
              label="Member"
              formKey="member_id"
              type="text"
              value={this.state.searchString}
              optionMap
              onFormValueChange={(formKey, value) => this.updateSearch(value)}
            />
          </Row>
          {options}
          <Button type="submit" onClick={(e) => this.issueBallot(e)}>Issue Ballot</Button>
        </Col>
      </div>
    )
  }

  async getElectionDetails () {
    try {
      const results = await membershipApi(HTTP_GET, `/election`, {id: this.props.params.electionId})
      this.setState({election: fromJS(results)})
    } catch (err) {
      return logError('Error loading election details', err)
    }
  }

  async getVoterList () {
    try {
      const results = await membershipApi(HTTP_GET, '/election/eligible/list',
        {election_id: this.props.params.electionId})
      this.setState({voters: fromJS(results).map((v) => `${v.get('name')} <${v.get('email_address')}>`)})
    } catch (err) {
      return logError('Error loading eligible voters', err)
    }
  }


  async issueBallot (e) {
    e.preventDefault()
    if (this.state.inSubmission || this.state.memberId === '') {
      return
    }
    this.setState({inSubmission: true})
    try {
      const results = await membershipApi(HTTP_POST, '/ballot/issue',
        {election_id: this.props.params.electionId,
         member_id: this.state.memberId})
      const lastResult = `${this.state.voters.get(this.state.memberId)} was issued a ballot`
      this.setState({lastResult: lastResult, memberId:'', searchString: ''})
    } catch (err) {
      const errorMessage = _get(err, ['response', 'body', 'err'], err.toString())
      const lastResult = `${this.state.voters.get(this.state.memberId)} was not issued a ballot because ${errorMessage}`
      this.setState({lastResult: lastResult})
      alert(lastResult)
      return logError('Error submitting ballot', err)
    } finally {
      this.setState({inSubmission: false})
    }
  }
}

export default connect((state) => state)(SignInKiosk)

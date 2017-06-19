import React, { Component } from 'react'
import { connect } from 'react-redux'
import { membershipApi } from '../../services/membership'
import {
  HTTP_GET,
  logError
} from '../../util/util'
import { fromJS } from 'immutable'
import { Link } from 'react-router'
import AddRole from '../admin/AddMeeting'
import AddMeeting from '../admin/AddRole'
import AddEligibleVoter from '../admin/AddEligibleVoter'
import ReactMarkdown from 'react-markdown'

class Member extends Component {

  constructor (props) {
    super(props)
    this.state = {
      member: null,
      inSubmission: false
    }
  }

  componentDidMount(){
    this.fetchMemberData()
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.fetchMemberData()
    }
  }

  render () {
    const roles = []
    const votes = []
    const meetings = []
    const memberData = this.state.member
    if (memberData === null) {
      return (<div></div>)
    }
    memberData.get('roles').forEach((role, index) => {
      roles.push(
        <div key={`role-${index}`}>{`${role.get('role')}: ${role.get('committee')}`}</div>
      )
    })
    memberData.get('meetings').forEach((meeting, index) => {
      meetings.push(
        <div key={`meeting-${index}`}>{meeting}</div>
      )
    })
    memberData.get('votes').forEach((vote, index) => {
      const canVote = !vote.get('voted') && vote.get('election_status') === 'in progress'
      votes.push(
        <div key={`vote-${index}`}>
          <Link to={`/elections/${vote.get('election_id')}/`}>
            {vote.get('election_name')}
            </Link>
          <span> Election Status: <strong>{vote.get('election_status')}</strong> You have {!vote.get('voted') && (<span>not yet</span>)} voted.
          </span>
          { canVote &&
          <Link to={`/vote/${vote.get('election_id')}/`}> Vote Now</Link>
          }
        </div>
      )
    })

    const admin = this.isAdmin()
    return (
      <div>
        <h2>Member Info</h2>
        <div>{`${memberData.getIn(['info', 'first_name'])} ${memberData.getIn(['info', 'last_name'])}`}</div>
        <p><img src={`/images/member-photos/${memberData.get('id')}.jpg`} alt={`${memberData.getIn(['info', 'first_name'])} ${memberData.getIn(['info', 'last_name'])}'s photo`} /></p>
        <h3>Biography</h3>
        <ReactMarkdown escapeHtml={true} source={memberData.getIn(['info', 'biography'])} />
        <h2>Committees</h2>
        {roles}
        <h2>Meetings attended</h2>
        {meetings}
        <h2>Eligible Votes</h2>
        {votes}
        {admin &&
         <div>
            <AddRole
              admin={admin}
              memberId={this.props.params.memberId ? this.props.params.memberId : this.state.member.get('id')}
              refresh={() => this.fetchMemberData()}
            />
           <AddMeeting
             admin={admin}
             memberId={this.props.params.memberId ? this.props.params.memberId : this.state.member.get('id')}
             refresh={() => this.fetchMemberData()}
           />
           <AddEligibleVoter
             admin={admin}
             memberId={this.props.params.memberId ? this.props.params.memberId : this.state.member.get('id')}
             refresh={() => this.fetchMemberData()}
           />
          </div>
        }
      </div>
    )
  }

  async fetchMemberData(){
    if (this.props.params.memberId !== undefined){
      try {
        const results = await membershipApi(HTTP_GET, `/admin/member/details`, {member_id: this.props.params.memberId})
        this.setState({member: fromJS(results)})
      } catch (err) {
        return logError('Error loading member details', err)
      }
    }
    else {
      try {
        const results = await membershipApi(HTTP_GET, `/member/details`)
        this.setState({member: fromJS(results)})
      } catch (err) {
        return logError('Error loading member details', err)
      }
    }
  }

  isAdmin() {
    const memberData = this.props.member.getIn(['user', 'data'], null)
    let admin = false
    if (memberData !== null) {
      memberData.get('roles').forEach((role) => {
        if (role.get('role') === 'admin' && role.get('committee') === 'general') {
          admin = true
        }
      })
    }
    return admin
  }

}

export default connect((state) => state)(Member)

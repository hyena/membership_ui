import {membershipApi} from "../services/membership"
import {logError, HTTP_GET, HTTP_POST} from "../util/util"
import {fromJS, Map} from 'immutable'

export default class ElectionClient {

  static async getVote (electionId, ballotKey) {
    try {
      return await membershipApi(HTTP_GET, `/election/${electionId}/vote/${ballotKey}`)
    } catch (err) {
      if (err.status !== 404) {
        return logError(`Error loading vote election_id=${electionId}, ballot_key=${ballotKey}`, err)
      }
    }
  }

  static async getElection (id) {
    try {
      const result = await membershipApi(HTTP_GET, `/election`, {'id': id})
      result.id = id
      return result
    } catch (err) {
      return logError(`Error loading election /election?id=${id}`, err)
    }
  }

  static async submitPaperBallot (ballot, override=false) {
    const ballotPost = fromJS(ballot).set('override', override)
    try {
      const result = await membershipApi(HTTP_POST, `/vote/paper`, ballotPost.toJSON())
      return fromJS(result)
    }
    catch (err) {
      if (err.status === 404) {
        logError(`Cannot submit unclaimed ballot #${ballot.ballot_key}`)
      }
      else {
        logError(`Unexpected error when submitting ballot ${ballotPost}`, err)
      }
    }
  }

}

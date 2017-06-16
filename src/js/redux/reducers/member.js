import { Map } from 'immutable'
import { fetchDataHandler } from './decorators'

export const MEMBER_STORE = 'member'

export const INITIAL_STATE = Map({
  user: Map({
    data: null,
    loading: false,
    err: null
  }),
  memberList: Map
})

function member (state = INITIAL_STATE, action) {
  if (action.store !== MEMBER_STORE) {
    return state
  }

  switch (action.type) {

    default:
      return state
  }
}

export default fetchDataHandler(member, MEMBER_STORE)

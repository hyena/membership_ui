import { fetchData } from './fetchDataActions'
import { membershipApi } from '../../services/membership'
import { MEMBER_STORE as store } from '../reducers/member'
import { AUTH_STORE } from '../reducers/auth'
import { USE_AUTH } from '../../config'

export function fetchMember () {
  return (dispatch, getState) => {
    const authStore = getState()[AUTH_STORE]
    const user = authStore.get('user', null)
    if (!USE_AUTH || user !== null) {
      dispatch(fetchData({
        apiService: membershipApi,
        route: '/member',
        store,
        keyPath: ['user']
      }))
    }
  }
}

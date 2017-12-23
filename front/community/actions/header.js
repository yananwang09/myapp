import * as types from '../actions/action-types';
import { myFetch } from '../../tools';

export function getUserBase() {
  return (dispatch) => {
    let url = '/api/community/user/base';
    let fetchObj = { method: 'get', credentials: 'include'};
    let outputObj = { type: types.GET_USER_BASE };
    myFetch(url, fetchObj, outputObj, dispatch);
  };
}

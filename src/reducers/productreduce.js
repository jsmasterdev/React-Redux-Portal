import * as types from '../constants/actionTypes';
export const initialState = {
    error: null
}
export default function (state = initialState, action) {
    switch (action.type) {
    case types.FETCH_LOGIN_SUCCESS:
        return { ...state, isLoading: true, error: null }
    default:
        return state
    }
}
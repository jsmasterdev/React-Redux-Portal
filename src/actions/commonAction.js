import * as types from '../constants/actionTypes';

export const pageLoading = (params) => {
    return (dispatch) => {
        dispatch(fetchPageLoading(params));
    };
}

export const fetchPageLoading = (data) => {
    return {
        type: types.FETCH_PAGE_LOADING,
        loading:data
    }
}
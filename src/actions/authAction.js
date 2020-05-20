import * as types from '../constants/actionTypes';
import $ from 'jquery';
import API from '../components/api'
import history from '../history';
export const fetchLoginData = (params) => {
    return (dispatch) => {
        dispatch(fetchPageLoading(true));
        var settings = {
            "url": API.GetToken,
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            "data": {
              "grant_type": "password",
              "userName": params.username,
              "password": params.password
            }
          }
          $.ajax(settings).done(function (response) {
          })
          .then(response => {
            window.localStorage.setItem('nevema_token', response.access_token);
            window.localStorage.setItem('nevema_userName', response.cuserName);
            window.localStorage.setItem('nevema_roles', response.roles);
            window.localStorage.setItem('nevema_loginUser', JSON.stringify(response));
            dispatch(fetchLoginDataSuccess(response));
            history.push('/sales-order')
        })
        .catch(err => {
            dispatch(fetchLoginDataFail(err.responseJSON.error_description));
        });
    };
}

export const fetchPageLoading = (data) => {
    return {
        type: types.FETCH_PAGE_LOADING,
        loading:data
    }
}
//login fail
export const fetchLoginDataFail = (param) => {
    return {
        type: types.FETCH_LOGIN_FAIL,
        error:param
    }
}

//login success
export const fetchLoginDataSuccess = (data) => {
    
    return {
        type: types.FETCH_LOGIN_SUCCESS,
        UserName:data.userName,
        Role:data.roles
    }
}
//change lang
export const changeLan = (params) => {
    return (dispatch) => {
        window.localStorage.setItem('nevema_lang',  params.value);
        window.localStorage.setItem('nevema_label',  params.label);
        dispatch(fetchChangeLan(params.value));
    };
}

export const fetchChangeLan = (value) => {
    return{
        type: types.FETCH_LANGUAGE_DATA,
        lang:value
    }
}

export const blankdispatch = () => {
    return (dispatch) => {
        dispatch(fetchBlankData());
    };
}
//error
export const fetchBlankData = () => {
    return{
        type: types.FETCH_BlANK_DATA,
        error:""
    }
}

export const dataServerFail = (params) => {
    return (dispatch) => {
        dispatch(fetchDataServerFail(params));
    };
}
//error
export const fetchDataServerFail = (params) => {
    return{
        type: types.FETCH_SERVER_FAIL,
        error:params
    }
}


//error


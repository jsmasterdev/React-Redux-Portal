import * as types from '../constants/actionTypes';
import SessionManager from '../components/session_manage';
import API from '../components/api'
import Axios from 'axios';
import history from '../history';

//get sales data
export const getSalesData = () => {
    var header = SessionManager.shared().getAuthorizationHeader();
    return (dispatch) => {
        Axios.get(API.GetSalesData, header)
        .then(result => {
           let data=result.data.Items;
           dispatch(fetchSalesData(data));
          });
        
    };
}

export const fetchSalesData = (salesData) => {
    return {
        type: types.FETCH_SALES_GETDATA,
        deploy: salesData
    }
}
//get customer data
export const getCustomerData = () => {
    var header = SessionManager.shared().getAuthorizationHeader();
    return (dispatch) => {
        Axios.get(API.GetCustomerData, header)
        .then(result => {
           let data=result.data.Items;
           dispatch(fetchCustomer(data));
          });
        
    };
}

export const fetchCustomer = (customerData) => {
    return {
        type: types.FETCH_CUSTOMER_DATA,
        deploy:customerData
    }
}

//save sales order
export const saveSalesOrder = (params) => {
    var headers = SessionManager.shared().getAuthorizationHeader();
    return (dispatch) => {
        Axios.post(API.PostSalesOrder, params, headers)
        .then(result => {
            dispatch(fetchSaveSales(result.data.NewId, params.customer));
            history.push('/sales-order-detail');

        });
    };
}
export const fetchSaveSales = (NewId, customerId) => {
    return {
        type: types.FETCH_SALES_SAVEDATA,
        newid:NewId,
        coustomercode: customerId,
        salesSave:true
    }
}

export const setUploadFile = (params) => {
    return (dispatch) => {
        dispatch(fetchsetUploadFile(params));
    };
        
}

export const fetchsetUploadFile = (params) => {
    return {
        type: types.FETCH_SALES_SALESUPLODFILE,
        salesFile: params
    }
}

export const salesFileBlank = () => {
    return (dispatch) => {
        dispatch(fetchsalesFileBlank());
    };
        
}

export const fetchsalesFileBlank = () => {
    return {
        type: types.FETCH_SALES_BLANKFILE,
        salesFile: []
    }
}
//get sales order
export const getSalesOrder = (salesorderid) => {
    var params={
        "salesorderid":salesorderid
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    return (dispatch) => {
        Axios.post(API.GetSalesDetail, params, headers)
        .then(result => {
            dispatch(fetchGetSaleDetail(result.data.Items));
        });
    };
    
}
export const fetchGetSaleDetail = (detailData) => {
    return {
        type: types.FETCH_GETSALES_DATA,
        detailData:detailData,
    }
}
//get sales Items
export const getSalesItem = (customercode) => {
    var params={
        "customercode":customercode
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    return (dispatch) => {
        Axios.post(API.GetSalesItems, params, headers)
        .then(result => {
            dispatch(fetchGetSalesItem(result.data.Items));
        });
    };
    
}
export const fetchGetSalesItem = (data) => {
    return {
        type: types.FETCH_GETSALESITEM_DATA,
        itemsData:data,
    }
}
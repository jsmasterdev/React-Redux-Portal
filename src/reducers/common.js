import * as types from '../constants/actionTypes';
export const initialState = {
    salesData: [],
    error: null
}
export default function (state = initialState, action) {
    switch (action.type) {
    case types.FETCH_SALES_GETDATA:
        return { ...state, salesData: action.deploy, error: null }
    case types.FETCH_CUSTOMER_DATA:
        return { ...state, customerData: action.deploy, error: null }
    case types.FETCH_SALES_SAVEDATA:
        return { ...state, salesorderid: action.newid,coustomercode: action.coustomercode, error: null }
    case types.FETCH_GETSALES_DATA:
        return { ...state, salesdetaildata: action.detailData, error: null }
    case types.FETCH_GETSALESITEM_DATA:
        return { ...state, salesItems: action.itemsData, error: null }
    case types.FETCH_SALES_SALESUPLODFILE:
        return { ...state, salesFile: action.salesFile, error: null }
    case types.FETCH_SALES_BLANKFILE:
        return { ...state, salesFile: action.salesFile, error: null }
    default:
        return state
    }
}
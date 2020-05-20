import { combineReducers, createStore } from 'redux'

import auth from './auth'
import productreduce from './productreduce'
import common from './common'

const reducers = combineReducers({
  auth,
  productreduce,
  common
})

export const store = createStore(reducers);
export default reducers

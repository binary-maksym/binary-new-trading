import {
  createStore,
  applyMiddleware,
  compose
}
from 'redux'
import thunk from 'redux-thunk'
import socket from '../middleware/socket'
// import chain from '../middleware/chain'
import StorageMiddleware from '../middleware/storage'
import PromiseMiddlware from '../middleware/promise'

import createLogger from 'redux-logger'
import rootReducer from '../reducers/root'

const finalCreateStore = compose(
  applyMiddleware(thunk, socket, PromiseMiddlware, /*chain,*/ StorageMiddleware, createLogger({
    stateTransformer: (state) => state.toJS()
  })),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)

export default function configureStore(initialState) {

  const store = finalCreateStore(rootReducer, initialState)

  // if (module.hot) {
  //   // Enable Webpack hot module replacement for reducers
  //   module.hot.accept('../reducers/root', () => {
  //     const nextRootReducer = require('../reducers/root')
  //     store.replaceReducer(nextRootReducer)
  //   })
  // }

  return store
}
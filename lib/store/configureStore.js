import {
    createStore, applyMiddleware, compose
}
from 'redux'
import thunk from 'redux-thunk'
import wsapi from '../middleware/socket'

import createLogger from 'redux-logger'
import rootReducer from '../reducers/trading_page'

const finalCreateStore = compose(
    applyMiddleware(thunk, createLogger(), wsapi),
    window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

export default function configureStore(initialState) {
    const store = finalCreateStore(rootReducer, initialState)

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers/trading_page', () => {
            const nextRootReducer = require('../reducers/trading_page')
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}

import {
    createStore, applyMiddleware, compose
}
from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise';
import socket from '../middleware/socket'

import createLogger from 'redux-logger'
import rootReducer from '../reducers/trading_page'
import Immutable from 'immutable';

const finalCreateStore = compose(
    applyMiddleware(thunk, socket, promiseMiddleware, createLogger({
        stateTransformer: (state) => {
            let newState = {};

            for (var i of Object.keys(state)) {
                if (Immutable.Iterable.isIterable(state[i])) {
                    newState[i] = state[i].toJS();
                } else {
                    newState[i] = state[i];
                }
            };

            return newState;
        }
    })),
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

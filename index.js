import configureStore from './lib/store/configureStore.js';
import {
    getSymbols, setSymbol, requestSymbols
}
from './lib/actions/symbols'

let store = configureStore();

store.dispatch(requestSymbols())

// store.dispatch(setSymbol('lol2'))
// store.dispatch(setSymbol('R_25'))
// store.dispatch(setSymbol('lol3'))

import configureStore from './lib/store/configureStore.js';
import {
    getSymbols, setSymbol, setMarket
}
from './lib/actions/symbols'

let store = configureStore();
// store.dispatch(setSymbol('lol2'))
store.dispatch(setSymbol('R_25'))
store.dispatch(setMarket("forex"))

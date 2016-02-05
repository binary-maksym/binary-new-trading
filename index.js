import configureStore from './lib/store/configureStore.js';
import action_creators from './lib/actions/core'

let store = configureStore();
// store.dispatch(setSymbol('lol2'))
// store.dispatch(action_creators.setSymbol('R_25'))
store.dispatch(action_creators.setMarket("forex"))

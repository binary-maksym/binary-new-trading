import configureStore from './lib/store/configureStore.js';
import action_creators from './lib/actions/core'

let store = configureStore();
// store.dispatch(action_creators.getSymbols())

// store.dispatch(setSymbol('lol2'))

store.dispatch(action_creators.setMarket("random"))
store.dispatch(action_creators.setSymbol('R_25'))
// store.dispatch(action_creators.setMarket("random"))
// store.dispatch(action_creators.setSymbol("R_500"))
// store.dispatch(action_creators.getContracts("R_50"))
store.dispatch(action_creators.getContracts())

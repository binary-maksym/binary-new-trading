import configureStore from './lib/store/configureStore.js';
import action_creators from './lib/actions/root'

let store = configureStore();

store.dispatch(action_creators.setMarket("random"))
store.dispatch(action_creators.setSymbol('R_25'))
store.dispatch(action_creators.getContracts())

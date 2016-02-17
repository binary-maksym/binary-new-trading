import configureStore from './store/configureStore.js';
import action_creators from './actions/root'

let store = configureStore();

store.dispatch(action_creators.setMarket("random"))
store.dispatch(action_creators.setSymbol('R_25'))
store.dispatch(action_creators.getContracts())

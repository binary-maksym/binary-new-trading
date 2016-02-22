import configureStore from './store/configureStore.js';
// import action_creators from './actions/root'
import TradingFormActions from './actions/trading_form_new';

let store = configureStore();
let actions = new TradingFormActions(store);

actions.setMarket("random")
actions.setSymbol('R_25')
// store.dispatch(action_creators.getContracts())

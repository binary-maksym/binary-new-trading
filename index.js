import configureStore from './lib/store/configureStore.js';
import {getMarkets} from './lib/actions/symbols' 

let store = configureStore();
store.dispatch(getMarkets())
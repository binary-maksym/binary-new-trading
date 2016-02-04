import configureStore from './lib/store/configureStore.js';
import {getSymbols,setSymbol} from './lib/actions/symbols' 

let store = configureStore();
store.dispatch(setSymbol('R_50'))
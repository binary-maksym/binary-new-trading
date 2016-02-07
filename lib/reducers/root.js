import {combineReducers} from 'redux';
import TradingFromReducer from './trading_form';

export default combineReducers({
    trading_form: TradingFromReducer
})

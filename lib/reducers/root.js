import TradingFormReducer from './trading_form';
import ErrorReducer from './error';
import Immutable, {
    Map, fromJS
}
from 'immutable';

export default function RootReducer(state = Map(), action) {

    let [
        trading_form, trading_error
    ] = TradingFormReducer(state.get('trading_form'), state.getIn(['error', 'trading_form']), action);

    state = state.set('trading_form', trading_form);
    if (!trading_error.isEmpty()) {
        state = state.setIn(['error', 'trading_form'], trading_error);
    }

    if (state.get('error') && state.get('error').isEmpty()) {
        state = state.delete('error');
    }

    return state;
}

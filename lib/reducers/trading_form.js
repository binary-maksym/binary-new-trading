import {
    PENDING_SYMBOLS,
    SUCCESS_SYMBOLS,
    FAILURE_SYMBOLS,
    SET_SYMBOL,
    SET_MARKET,

    PENDING_CONTRACTS,
    SUCCESS_CONTRACTS,
    FAILURE_CONTRACTS
}
from '../actions/actions_types';
import Parser from '../parsers/symbols';
import {
    Map, List, fromJS
}
from 'immutable';

const initialState = Map({
    trading_form: Map({

    })
});


class ActionHandlers {

    static PENDING_SYMBOLS(state, error, action) {
        if (typeof action.promise === 'object') {
            state = state.setIn(['symbols', 'status'], 'pending').setIn(['symbols', 'dispatched'], action.promise);
        }
        return [state, error];
    }

    static FAILURE_SYMBOLS(state, error, action) {
        state = state.setIn(['symbols', 'status'], 'error').deleteIn(['symbols', 'dispatched']);
        error = fromJS(action.error);
        return [state, error];
    }

    static SUCCESS_SYMBOLS(state, error, action) {
        let markets = action.data;
        let parser = new Parser(markets);
        if (parser.error) {

            // state = handleFailureSymbols(state, {
            //     error: parser.error
            // });
        } else {
            state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready').deleteIn(['symbols', 'dispatched']);
        }

        return [state, error];
    }

    static SET_MARKET(state, error, action) {
        let market = action.market;

        if (state.getIn(['symbols', 'status']) === 'ready') {

            let parsed = state.getIn(['symbols', 'data']);
            let first_market = parsed.getFirstActiveMarket();

            if (!(market && parsed.isMarketOpened(market))) {
                if (state.getIn(['storage', 'market']) && parsed.isMarketOpened(state.getIn(['storage', 'market']))) {
                    market = state.getIn(['storage', 'market']);
                } else {
                    let first_market = parsed.getFirstActiveMarket();
                    if (first_market && first_market.get('market')) {
                        market = first_market.get('market');
                    }
                }
            }

            if (market) {
                state = state.set('market', market);
                state = state.setIn(['storage', 'market'], market);
            }
        }
        return [state, error];
    }

    static SET_SYMBOL(state, error, action) {
        let symbol = action.symbol;
        let parsed = state.getIn(['symbols', 'data']);

        let market = state.getIn(['market']);
        if (state.getIn(['symbols', 'status']) === 'ready' && market && parsed.isMarketOpened(market)) {


            if (!symbol) {
                let first_active_symbol = parsed.getFirstActiveSymbol(market);
                let stored_symbol_name = state.getIn(['storage', 'symbol']);
                let stored_symbol = parsed.getSymbol(stored_symbol_name);
                if (stored_symbol && stored_symbol.get('state') && (stored_symbol.get('market') === market || stored_symbol.get('sub_market') === market)) {
                    symbol = stored_symbol_name;
                } else if (first_active_symbol) {
                    symbol = first_active_symbol.get('symbol');
                }
            }

            if (symbol) {
                state = state.set('symbol', symbol);
                state = state.setIn(['storage', 'symbol'], symbol);
            }
        }
        return [state, error];
    }
}

export default function TradingFormReducer(state=Map(), error=Map(), action) {

    if (ActionHandlers[action.type]) {
        return ActionHandlers[action.type](state, error, action);
    } else {
        return [state, error];
    }
}

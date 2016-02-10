import Immutable from 'immutable';
import * as actions_types from '../actions/actions_types';
import Parser from '../parsers/symbols';

const initialState = Immutable.Map();
export default (state = initialState, action) => ActionsHandlers[actions_types[action.type]] ? ActionsHandlers[actions_types[action.type]](state, action) : state;

class ActionsHandlers {

    static PENDING_SYMBOLS(state, action) {
        if (typeof action.promise === 'object') {
            state = state.setIn(['symbols', 'status'], 'pending').setIn(['symbols', 'dispatched'], action.promise);
        }
        return state;
    }

    static FAILURE_SYMBOLS(state, action) {
        state = state.set('error', Immutable.fromJS(action.error)).setIn(['symbols', 'status'], 'error').deleteIn(['symbols', 'dispatched']);
        return state;
    }

    static SUCCESS_SYMBOLS(state, action) {
        let markets = action.data;
        let parser = new Parser(markets);
        if (parser.error) {

            // state = handleFailureSymbols(state, {
            //     error: parser.error
            // });
        } else {
            state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready').deleteIn(['symbols', 'dispatched']);
        }

        return state;
    }

    static SET_MARKET(state, action) {
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
        return state;
    }

    static SET_SYMBOL(state, action) {
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
        return state;
    }
}

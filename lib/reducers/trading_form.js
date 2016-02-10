import Immutable from 'immutable';
import * as actions_types from '../actions/actions_types';
import Err from '../utils/errors';
import Parser from '../parsers/symbols';

const initialState = Immutable.Map();
export default (state = initialState, action = {}) => ActionsHandlers[actions_types[action.type]] ? ActionsHandlers[actions_types[action.type]](state, action) : state;

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

        const markets = action.data;
        const parser = new Parser(markets);

        state = state.deleteIn(['symbols', 'dispatched']);

        if (parser.error) {
            state = state.setIn(['symbols', 'status'], 'error');
            state = state.set('error', parser.error);
        } else {
            state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready');
        }

        return state;
    }

    static SET_MARKET(state, action) {
        let market = action.market;

        if (state.getIn(['symbols', 'status']) === 'ready') {

            const parsed = state.getIn(['symbols', 'data']);

            if (market !== undefined) {
                if (!parsed.isMarketOpened(market)) {
                    state = state.set('error', Err('ERROR_MARKET_CLOSED'));
                    market = undefined;
                }
            } else {
                if (state.getIn(['storage', 'market']) && parsed.isMarketOpened(state.getIn(['storage', 'market']))) {
                    market = state.getIn(['storage', 'market']);
                } else {
                    let first_market = parsed.getFirstActiveMarket();
                    if (first_market && first_market.get('market')) {
                        market = first_market.get('market');
                    } else {
                        if (!parsed.isMarketOpened(market)) {
                            state = state.set('error', Err('ERROR_ALL_MARKETS_CLOSED'))
                        }
                    }
                }
            }

            if (market) {
                state = state.set('market', market);
                state = state.setIn(['storage', 'market'], market);
            }
        } else {
            state = state.set('error', Err('ERROR_SYMBOLS_NOT_LOADED'));
        }
        return state;
    }

    static SET_SYMBOL(state, action) {

        if (state.getIn(['symbols', 'status']) === 'ready') {
            let symbol = action.symbol;
            const parsed = state.getIn(['symbols', 'data']);

            let market = state.getIn(['market']);
            if (market) {
                if (!parsed.isMarketOpened(market)) {
                    state = state.set('error', Err('ERROR_MARKET_CLOSED'));
                } else {
                    if (symbol !== undefined) {
                        if (!parsed.isSymbolActive(symbol)) {
                            state = state.set('error', Err('ERROR_SYMBOL_IS_CLOSED'));
                            symbol = undefined;
                        }
                    } else {
                        let stored_symbol_name = state.getIn(['storage', 'symbol']);
                        let stored_symbol = parsed.getSymbol(stored_symbol_name);
                        if (stored_symbol && stored_symbol.get('state') && (stored_symbol.get('market') === market || stored_symbol.get('sub_market') === market)) {
                            symbol = stored_symbol_name;
                        } else {
                            let first_active_symbol = parsed.getFirstActiveSymbol(market);
                            symbol = first_active_symbol.get('symbol');
                        }
                    }
                }

                if (symbol) {
                    state = state.set('symbol', symbol);
                    state = state.setIn(['storage', 'symbol'], symbol);
                }

            } else {
                state = state.set('error', Err('ERROR_MARKET_NOT_SELECTED'))
            }
        } else {
            state = state.set('error', Err('ERROR_SYMBOLS_NOT_LOADED'));
        }

        return state;
    }
}

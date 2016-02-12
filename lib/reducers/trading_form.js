import Immutable from 'immutable';
import * as actions_types from '../actions/actions_types';
import Err from '../utils/errors';
import SymbolsParser from '../parsers/symbols';
import ContractsParser from '../parsers/contracts';
import {
    checkForSymbolsLoadedError,
    checkForMarketError,
    checkForSymbolError
}
from '../helpers/trading_form_reducer';

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
        const parser = new SymbolsParser(markets);

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

        const setError = error => state.set('error', Err(error));
        const setMarket = market => state.set('market', market).setIn(['storage', 'market'], market);

        const market = action.market;
        if (market) {
            const market_error = checkForMarketError(setMarket(market));
            if (!market_error) {
                state = setMarket(market);
            } else {
                state = setError(market_error);
            }
        } else {
            const symbols_loaded_err = checkForSymbolsLoadedError(state);
            if (!symbols_loaded_err) {
                const parsed = state.getIn(['symbols', 'data']);
                if (state.getIn(['storage', 'market']) && parsed.isMarketOpened(state.getIn(['storage', 'market']))) {
                    state = setMarket(state.getIn(['storage', 'market']));
                } else {
                    const first_opened_market = parsed.getFirstActiveMarket();
                    if (first_opened_market && first_opened_market.get('market')) {
                        state = setMarket(first_opened_market.get('market'));
                    } else {
                        state = setError('ERROR_ALL_MARKETS_CLOSED');
                    }
                }
            } else {
                state = setError(symbols_loaded_err);
            }
        }

        return state;
    }

    static SET_SYMBOL(state, action) {

        const setError = error => state.set('error', Err(error));
        const setSymbol = symbol => state.set('symbol', symbol).setIn(['storage', 'symbol'], symbol);

        const symbol = action.symbol;
        if (symbol) {
            const symbol_error = checkForSymbolError(setSymbol(symbol));
            if (!symbol_error) {
                state = setSymbol(symbol);
            } else {
                state = setError(symbol_error);
            }
        } else {
            const market_error = checkForMarketError(state);
            if (market_error) {
                // Get default symbol if empty
                const parsed = state.getIn(['symbols', 'data']);
                const stored_symbol = state.getIn(['storage', 'symbol']);
                if (stored_symbol) {
                    const stored_symbol_details = parsed.getSymbol(stored_symbol);
                    if (stored_symbol_details && stored_symbol_details.get('state') && (stored_symbol_details.get('market') === market || stored_symbol_details.get('submarket') === market)) {
                        state = setSymbol(stored_symbol);
                    }
                } else {
                    const first_active_symbol = parsed.getFirstActiveSymbol(market);
                    state = setSymbol(first_active_symbol.get('symbol'));
                }
            } else {
                state = setError(market_error);
            }
        }

        return state;
    }

    static PENDING_CONTRACTS(state, action) {

        const setError = error => state.set('error', Err(error));
        const symbol_error = checkForSymbolError(state);

        if (!symbol_error) {
            const symbol = state.get('symbol');
            if (action.symbol === symbol) {
                state = state.set('contracts', Immutable.fromJS({
                    status: 'pending',
                    symbol: action.symbol,
                    dispatched: action.promise
                }));
            } else {
                state = setError('ERROR_WRONG_CONTRACT_SYMBOL_ASKED');
            }
        } else {
            state = setError(symbol_error);
        }

        return state;
    }

    static FAILURE_CONTRACTS(state, action) {

        const setError = error => state.set('error', Err(error));

        if (state.getIn(['contracts', 'status']) === 'pending') {
            if (state.getIn(['contracts', 'symbol']) === action.symbol) {
                state = state.set('contracts', Immutable.fromJS({
                    status: 'error',
                    symbol: action.symbol
                })).set('error', Immutable.fromJS(action.error))
            } else {
                state = setError('ERROR_WRONG_SYMBOL_PASSED');
            }
        } else {
            state = setError('ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE');
        }

        return state;
    }

    static SUCCESS_CONTRACTS(state, action) {

        const setError = error => state.set('error', Err(error));

        if (state.getIn(['contracts', 'status']) === 'pending') {
            if (state.getIn(['contracts', 'symbol']) === action.symbol) {

                const parser = new ContractsParser(action.contracts_for);
                if (!parser.error) {
                    state = state.set('contracts', Immutable.fromJS({
                        status: 'ready',
                        symbol: action.symbol,
                        data: parser
                    }));
                } else {
                    state = state.set('contracts', Immutable.fromJS({
                        status: 'error',
                        symbol: action.symbol
                    })).set('error', parser.error);
                }
            } else {
                state = setError('ERROR_WRONG_SYMBOL_PASSED');
            }
        } else {
            state = setError('ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE');
        }

        return state;
    }

    static SET_START_TIME(state, action) {

        const setError = error => state.set('error', Err(error));
        const setStartTime = start_time => state.set('start_time', start_time).setIn(['storage', 'start_time'], start_time);

        const start_time = action.start_time;
        if(start_time){
            const start_time_error = checkStartTimeError(setSymbol(symbol));
        }
        else{

        }
    }
}

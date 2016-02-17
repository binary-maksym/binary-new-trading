import Immutable from 'immutable';
import * as actions_types from '../actions/actions_types';
import Err from '../helpers/errors';
import SymbolsParser from '../parsers/symbols';
import ContractsParser from '../parsers/contracts';

const initialState = Immutable.Map();
export default (state = initialState, action = {}) => ActionsHandlers[actions_types[action.type]] ? ActionsHandlers[actions_types[action.type]](state, action) : state;


class ActionsHandlers {

    static PENDING_SYMBOLS(state, action) {
        state = state.setIn(['symbols', 'status'], 'pending');
        return state;
    }

    static FAILURE_SYMBOLS(state, action) {
        state = state.set('error', Immutable.fromJS(action.error)).setIn(['symbols', 'status'], 'error');
        return state;
    }

    static SUCCESS_SYMBOLS(state, action) {

        const markets = action.data;
        const parser = new SymbolsParser(markets);

        if (parser.error) {
            state = state.setIn(['symbols', 'status'], 'error');
            state = state.set('error', parser.error);
        } else {
            state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready');
        }

        return state;
    }

    static SET_MARKET(state, action) {

        const setError = error => state.set('error', Err._(error));
        const setMarket = market => Immutable.Map({
            market: market,
            symbols: state.get('symbols'),
        }).setIn(['storage', 'market'], market);

        if (state.getIn(['symbols', 'status']) === 'ready') {
            const market = action.market;
            const parsed = state.getIn(['symbols', 'data']);
            if (market) {
                if (parsed.isMarketOpened(market)) {
                    state = setMarket(market);
                } else {
                    state = setError('ERROR_MARKET_CLOSED');
                }
            } else {
                // Set up default market
                if (state.getIn(['storage', 'market']) && parsed.isMarketOpened(state.getIn(['storage', 'market']))) {
                    state = setMarket(state.getIn(['storage', 'market']));
                } else {
                    const first_opened_market = parsed.getFirstOpenedMarket();
                    if (first_opened_market && first_opened_market.get('market')) {
                        state = setMarket(first_opened_market.get('market'));
                    } else {
                        state = setError('ERROR_ALL_MARKETS_CLOSED');
                    }
                }
            }
        } else {
            state = setError('ERROR_SYMBOLS_NOT_LOADED');
        }

        return state;
    }

    static SET_SYMBOL(state, action) {

        const setError = error => state.set('error', Err._(error));
        const setSymbol = symbol => Immutable.Map({
            market: state.get('market'),
            symbol: symbol,
            symbols: state.get('symbols'),
        }).setIn(['storage', 'symbol'], symbol);

        if (state.getIn(['symbols', 'status']) === 'ready') {
            const market = state.get('market');
            if (market) {
                const parsed = state.getIn(['symbols', 'data']);
                const symbol = action.symbol;
                if (symbol) {
                    if (parsed.isSymbolOpened(symbol)) {
                        state = setSymbol(symbol);
                    } else {
                        state = setError('ERROR_SYMBOL_IS_CLOSED');
                    }
                } else {
                    // Set up default symbol
                    const stored_symbol = state.getIn(['storage', 'symbol']);
                    const stored_symbol_details = parsed.getSymbol(stored_symbol);

                    if (stored_symbol && stored_symbol_details && stored_symbol_details.get('state') && (stored_symbol_details.get('market') === market || stored_symbol_details.get('submarket') === market)) {
                        state = setSymbol(stored_symbol);
                    } else {
                        const first_opened_symbol = parsed.getFirstActiveSymbol(market);
                        state = setSymbol(first_opened_symbol.get('symbol'));
                    }
                }
            } else {
                state = setError('ERROR_MARKET_NOT_SELECTED');
            }

        } else {
            state = setError('ERROR_SYMBOLS_NOT_LOADED');
        }

        return state;
    }

    static PENDING_CONTRACTS(state, action) {

        const setError = error => state.set('error', Err._(error));

        const symbol = state.get('symbol');

        if (symbol) {
            if (action.symbol === symbol) {
                state = state.set('contracts', Immutable.fromJS({
                    status: 'pending',
                    symbol: action.symbol
                }));
            } else {
                state = setError('ERROR_WRONG_CONTRACT_SYMBOL_ASKED');
            }
        } else {
            state = setError('ERROR_NOT_SELECTED');
        }

        return state;
    }

    static FAILURE_CONTRACTS(state, action) {

        const setError = error => state.set('error', Err._(error));

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

        const setError = error => state.set('error', Err._(error));

        if (state.getIn(['contracts', 'status']) === 'pending') {
            if (state.getIn(['contracts', 'symbol']) === action.symbol) {

                const parser = new ContractsParser(action.data.available);
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

        const setError = error => state.set('error', Err._(error));
        const setStartTime = start_time => state.set('start_time', start_time).setIn(['storage', 'start_time'], start_time);


        if (state.getIn(['contracts', 'status']) === 'ready') {

        } else {
            state = setError('ERROR_CONTRACTS_NOT_LOADED');
        }


    }
}

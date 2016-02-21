import {
    WS_API
}
from '../middleware/socket';
import Immutable from 'immutable';

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
from './actions_types';

import Err from '../helpers/errors';

const SymbolsActions = (() => {

    const areSymbolsPending = (trading_form) => {

        if (trading_form.getIn(['symbols', 'status']) === 'pending') {
            return true;
        } else {
            return false;
        }
    }


    let _get_symbols_promise;
    const getSymbols = () => (dispatch, getState) => {

        if (!areSymbolsPending(getState().get('trading_form'))) {
            _get_symbols_promise = dispatch({
                [WS_API]: {
                    types: [PENDING_SYMBOLS, SUCCESS_SYMBOLS, FAILURE_SYMBOLS],
                    active_symbols: "brief"
                }
            });
        }
        return _get_symbols_promise;
    }


    const setMarket = (market) => (dispatch) => {
        dispatch(SymbolsActions.getSymbols()).then(() => {
            let action = {
                type: SET_MARKET
            };
            if (market) {
                action.market = market;
            }
            return dispatch(action);
        }).catch((error) => Err.process(error));
    }


    const setSymbol = (symbol) => (dispatch) => {
        dispatch(SymbolsActions.getSymbols()).then(() => {
            let action = {
                type: SET_SYMBOL
            }
            if (symbol) {
                action.symbol = symbol;
            }
            return dispatch(action);
        }).catch((error) => Err.process(error));
    }

    const getContracts = () => (dispatch, getState) => {

        const dispatch_action = symbol => {
            if (symbol) {
                dispatch({
                    symbol: symbol,
                    [WS_API]: {
                        types: [PENDING_CONTRACTS, SUCCESS_CONTRACTS, FAILURE_CONTRACTS],
                        contracts_for: symbol
                    }
                })
            }
        }

        if (areSymbolsPending(getState().get('trading_form'))) {
            dispatch(SymbolsActions.getSymbols()).then(() => dispatch_action(getState().getIn(['trading_form', 'symbol'])))
        } else {
            return dispatch_action(getState().getIn(['trading_form', 'symbol']));
        }
    }

    return {
        getSymbols,
        setMarket,
        setSymbol,

        getContracts
    }
})();
export default SymbolsActions;

import {
    WS_API
}
from '../middleware/socket';
import Immutable from 'immutable';

export const PENDING_SYMBOLS = 'PENDING_SYMBOLS'
export const SUCCESS_SYMBOLS = 'SUCCESS_SYMBOLS'
export const FAILURE_SYMBOLS = 'SELECT_MARKET'
export const SET_SYMBOL = 'SET_SYMBOL'
export const SET_MARKET = 'SET_MARKET'

const areSymbolsPending = (state) => {
    if (state.get('status') === 'pending') {
        return true;
    } else {
        return false;
    }
}

export const getSymbols = () => {
    return (dispatch, getState) => {
        if (!areSymbolsPending(getState().symbols)) {
            return dispatch({
                [WS_API]: {
                    types: [PENDING_SYMBOLS, SUCCESS_SYMBOLS, FAILURE_SYMBOLS],
                    active_symbols: "brief"
                }
            });
        } else {
            return getState().symbols.get('dispatched');
        }
    }
}

export const setSymbol = (symbol) => {
    return (dispatch, getState) => {
        dispatch(getSymbols()).then(() => {
            return dispatch({
                type: SET_SYMBOL,
                symbol
            });
        });
    }
}

export const setMarket = (market) => {
    return (dispatch, getState) => {
        dispatch(getSymbols()).then(() => {
            return dispatch({
                type: SET_MARKET,
                market
            });
        });
    }
}

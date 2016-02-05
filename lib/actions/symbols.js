import {
    WS_API
}
from '../middleware/socket';
import Immutable from 'immutable';
import {
    ACTIONS_MAP
}
from './common';

export const PENDING_SYMBOLS = 'PENDING_SYMBOLS'
export const SUCCESS_SYMBOLS = 'SUCCESS_SYMBOLS'
export const FAILURE_SYMBOLS = 'SELECT_MARKET'
export const SET_SYMBOL = 'SET_SYMBOL'
export const SET_MARKET = 'SET_MARKET'

const SymbolsActions = (() => {

    const areSymbolsPending = (state) => {

        if (state.get('status') === 'pending') {
            return true;
        } else {
            return false;
        }
    }

    const getSymbols = () => {

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

    const setMarket = (market) => {

        return (dispatch, getState) => {
            dispatch(SymbolsActions.getSymbols()).then(() => {
                return dispatch({
                    type: SET_MARKET,
                    market
                });
            });
        }
    }

    const setSymbol = (symbol) => {

        return (dispatch, getState) => {
            dispatch(SymbolsActions.getSymbols()).then(() => {
                return dispatch({
                    type: SET_SYMBOL,
                    symbol
                });
            });
        }
    }


    return {
        getSymbols,
        setMarket,
        setSymbol
    }
})();
export default SymbolsActions;

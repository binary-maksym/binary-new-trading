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

        if (state.getIn(['symbols', 'status']) === 'pending') {
            return true;
        } else {
            return false;
        }
    }

    const getSymbols = () => {

        return (dispatch, getState) => {
            if (!areSymbolsPending(getState().trading_form)) {
                return dispatch({
                    [WS_API]: {
                        types: [PENDING_SYMBOLS, SUCCESS_SYMBOLS, FAILURE_SYMBOLS],
                        active_symbols: "brief"
                    }
                });
            } else {
                return getState().getIn('symbols', 'dispatched');
            }
        }
    }

    const setMarket = (market) => {

        return (dispatch, getState) => {
            dispatch(SymbolsActions.getSymbols()).then(() => {
                let action = {
                    type: SET_MARKET
                };
                if (market) {
                    action.market = market;
                }
                return dispatch(action);
            });
        }
    }

    const setSymbol = (symbol) => {

        return (dispatch, getState) => {
            dispatch(SymbolsActions.getSymbols()).then(() => {
                let action = {
                    type: SET_SYMBOL
                }
                if (symbol) {
                    action.symbol = symbol;
                }
                return dispatch(action);
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

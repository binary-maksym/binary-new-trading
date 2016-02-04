import {
    WS_API
}
from '../middleware/socket';
import Immutable from 'immutable';

export const PENDING_SYMBOLS = 'PENDING_SYMBOLS'
export const SUCCESS_SYMBOLS = 'SUCCESS_SYMBOLS'
export const FAILURE_SYMBOLS = 'SELECT_MARKET'

export const SET_SYMBOL = 'SET_SYMBOL'

export const getSymbols = () => {
    return {
        [WS_API]: {
            types: [PENDING_SYMBOLS, SUCCESS_SYMBOLS, FAILURE_SYMBOLS],
            active_symbols: "brief"
        }
    }
}

export const setSymbol = (symbol) => {
    return (dispatch,getState) => {
        dispatch(getSymbols()).then(()=>{
            dispatch({
                type: SET_SYMBOL,
                symbol: symbol,
            })
        });
    }
}

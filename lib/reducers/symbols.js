import {
    PENDING_SYMBOLS, SUCCESS_SYMBOLS, FAILURE_SYMBOLS, SET_SYMBOL, SET_MARKET
}
from '../actions/symbols';
import Parser from '../parsers/symbols';
import {
    Map, List
}
from 'immutable';

const processMarkets = (state, markets) => {
    let parser = new Parser(markets);
    state = state.set('symbols', parser).set('status', 'ready').delete('dispatched');
    return state;
}

const setSymbol = (state, symbol) => {
    // if (state.get('symbols').isSymbolActive(symbol)) {
    //     state = state.set('selected_symbol', symbol);
    // }
    return state;
}

export default function MarketsReducer(state = Map(), action = {}) {
    switch (action.type) {
        case PENDING_SYMBOLS:
            return state.set('status', 'pending').set('dispatched', action.promise);
        case SUCCESS_SYMBOLS:
            return processMarkets(state, action.data);
        case FAILURE_SYMBOLS:
            return state.set('status', 'error').set('error', action.error).delete('dispatched');
        case SET_SYMBOL:
            return setSymbol(state, action.symbol);
        case SET_MARKET:
            // return setMarket(state, action.symbol);
        default:
            return state;
    }
}

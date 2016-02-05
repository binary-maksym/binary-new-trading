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


const setMarket = (state, market) => {

    if (state.get('symbols').isMarketOpened(market)) {
        state = state.set('selected_market', market);
    }

    return state;
}

const setSymbol = (state, symbol) => {

    if (!symbol) {
        symbol = sessionStorage.getItem('symbol');
    }

    let market = state.get('selected_market');
    let symbol_details = state.get('symbols').getSymbol(symbol);
    if (state.get('symbols').isSymbolActive(symbol) && (!market || market === symbol_details.get('market'))) {
        state = state.set('selected_symbol', symbol);
    } else if (market) {
        state = state.set('selected_symbol', state.get('symbols').getFirstActiveSymbol(market).get('symbol'));
    }
    sessionStorage.setItem('symbol', state.get('selected_symbol'))
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
            return setMarket(state, action.market);
        default:
            return state;
    }
}

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
    state = state.setIn(['symbols','data'], parser).setIn(['symbols', 'status'], 'ready').deleteIn(['symbols', 'dispatched']);
    return state;
}


const setMarket = (state, market) => {

    console.log(state.toJS());
    if (state.getIn(['symbols','data']).isMarketOpened(market)) {
        state = state.set('market', market);
    }

    return state;
}

const setSymbol = (state, symbol) => {

    if (!symbol) {
        symbol = sessionStorage.getItem('symbol');
    }

    let market = state.get('market');
    let symbol_details = state.getIn(['symbols','data']).getSymbol(symbol);
    if (state.getIn(['symbols','data']).isSymbolActive(symbol) && (!market || market === symbol_details.get('market'))) {
        state = state.set('symbol', symbol);
    } else if (market) {
        state = state.set('symbol', state.getIn(['symbols','data']).getFirstActiveSymbol(market).get('symbol'));
    }
    sessionStorage.setItem('symbol', state.get('selected_symbol'))
    return state;
}

const initialState = Map({

});

export default function TradingFromReducer(state = Map(), action = {}) {
    switch (action.type) {
        case PENDING_SYMBOLS:
            return state.setIn(['symbols', 'status'], 'pending').setIn(['symbols', 'dispatched'], action.promise);
        case SUCCESS_SYMBOLS:
            return processMarkets(state, action.data);
        case FAILURE_SYMBOLS:
            return state.setIn(['symbols', 'status'], 'error').setIn(['symbols', 'error'], action.error).deleteIn(['symbols', 'dispatched']);
        case SET_SYMBOL:
            return setSymbol(state, action.symbol);
        case SET_MARKET:
            return setMarket(state, action.market);
        default:
            return state;
    }
}

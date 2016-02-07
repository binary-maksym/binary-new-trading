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
    state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready').deleteIn(['symbols', 'dispatched']);
    return state;
}

const setMarket = (state, market) => {

    if (state.getIn(['symbols', 'status']) === 'ready') {

        let parsed = state.getIn(['symbols', 'data']);

        if (!market) {
            market = state.getIn(['storage', 'market']);
            if (!parsed.isMarketOpened(market)) {
                let market_obj = parsed.getFirstActiveMarket();
                if (market_obj) {
                    market = market_obj.get('market');
                }
            }
        }

        if (market) {
            state = state.set('market', market);
            state = state.setIn(['storage', 'market'], market);
            sessionStorage.setItem('market', market);
        }
    }

    return state;
}

const setSymbol = (state, symbol) => {

    let parsed = state.getIn(['symbols', 'data']);

    let market = state.get('market');
    if (state.getIn(['symbols', 'status']) === 'ready' && market && parsed.isMarketOpened(market)) {


        if (!symbol) {
            let first_active_symbol = parsed.getFirstActiveSymbol(market);
            let stored_symbol_name = state.getIn(['storage', 'symbol']);
            let stored_symbol = parsed.getSymbol(stored_symbol_name);
            if (stored_symbol && stored_symbol.get('state') && (stored_symbol.get('market') === market || stored_symbol.get('sub_market') === market)) {
                symbol = stored_symbol_name;
            } else if (first_active_symbol) {
                symbol = first_active_symbol.get('symbol');
            }
        }

        if (symbol) {
            state = state.set('symbol', symbol);
            state = state.setIn(['storage', 'symbol'], symbol);
        }
    }
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

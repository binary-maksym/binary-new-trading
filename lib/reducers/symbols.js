import {
    REQUEST_MARKETS, HANDLE_MARKETS, SELECT_MARKET
}
from '../actions/symbols';
import Parser from '../parsers/symbols';
import {
    Map, List
}
from 'immutable';

let requestMarkets = (state) => {
    state = state.set('pending_markets', 1).delete('markets');
    return state;
}

let handleMarkets = (state, markets) => {
    let parser = new Parser(markets);
    state = state.set('pending_markets', 0).set('markets', parser);
    return state;
}

let selectMarket = (state, market) => {
    if (!state.get('pending_markets') && state.has('markets') && state.has('markets').isMarketOpened(market)) {
        state = state.set('active_market', market);
    }
    return state;
}

export default function MarketsReducer(state = Map(), action = {}) {
    switch (action.type) {
        case REQUEST_MARKETS:
            return requestMarkets(state);
        case HANDLE_MARKETS:
            return handleMarkets(state, action.markets);
        case SELECT_MARKET:
            return selectMarket(state, action.market)
        default: return state;
    }
}

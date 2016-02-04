import {
    WS_API
}
from '../middleware/socket';

export const REQUEST_MARKETS = 'REQUEST_MARKETS'
export const HANDLE_MARKETS = 'HANDLE_MARKETS'
export const SELECT_MARKET = 'SELECT_MARKET'

import ws from '../utils';

export let requestMarkets = () => {
    ws.send(JSON.stringify({
        "active_symbols": "brief"
    }))
    return {
        type: REQUEST_MARKETS
    }
}

export let handleMarkets = (response) => {
    return {
        type: HANDLE_MARKETS,
        markets: response
    }
}

export let selectMarket = (market) => {
    return {
        type: selectMarket,
        market: market
    }
}

export let getMarkets = () => {
    return {
        [WS_API]: {
            active_symbols: "brief"
        },
        type: 'GET_MARKETS'
    }
}

// let selectRequestedMarket

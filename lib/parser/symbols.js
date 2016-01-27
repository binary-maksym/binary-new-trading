/**
 * Class for parsing Websocket response for "active_symbols" request
 *
 * @class SymbolsParser
 * @constructor
 * @example
 *      let parsed_data = new SymbolsParser(response.active_symbols);
 *      let opened_markets = parsed_data.getMarkets(1);
 */

import config from '../../config';
import {
    List, Map, fromJS
}
from 'immutable';

export default class SymbolsParser {

    /**
     * @method constructor
     * @param {Array} symbols
     */
    constructor(symbols) {
        const tree = this._parse(symbols);
        Object.defineProperties(this, {
            _symbols: {
                get: () => symbols,
                set: () => {}
            },
            _tree: {
                get: () => tree,
                set: () => {}
            }
        });
    }

    /**
     * @method _parse
     * @param {Array} symbols
     * @return {Map()} tree
     */
    _parse(s) {
        let symbols = fromJS(s);
        let sorted_symbols = this._sortSymbolsList(symbols);
        let markets = Map();
        sorted_symbols.forEach((s) => {
            markets = this._addSymbolToTree(markets, s);
        })
        return markets;
    }

    /**
     * @method _sortSymbolsList
     * @param {List()} symbols
     * @return {List()} symbols
     */
    _sortSymbolsList
(symbols) {
        if (List.isList(symbols)) {
            symbols = symbols.sort((a, b) => {
                return config.markets_order[a.get('submarket')] - config.markets_order[b.get('submarket')]
            }).sort((a, b) => {
                if (a.get('submarket') === b.get('submarket')) {
                    if (a.get('display_name') > b.get('display_name')) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    return 0;
                }
            })
        }
        return symbols;
    }

    /**
     * Adds symbol to market/submarket tree.
     *
     * @method _addSymbolToTree
     * @param {Map()} markets
     * @param {Map()} symbol
     * @return {Map()} matkets with symbol added    
     */
    _addSymbolToTree(markets = Map(), symbol) {
        if (Map.isMap(symbol) && symbol.has('is_trading_suspended') && symbol.has('exchange_is_open') && symbol.get('market') && symbol.get('market_display_name') && symbol.get('submarket_display_name') && symbol.get('submarket') && symbol.get('symbol') && symbol.get('display_name')) {
            let state = !symbol.get('is_trading_suspended') && symbol.get('exchange_is_open');
            let list = [{
                market: symbol.get('market'),
                name: symbol.get('market_display_name'),
                is_sub: 0
            }, {
                market: symbol.get('submarket'),
                name: symbol.get('submarket_display_name'),
                is_sub: 1
            }, ];

            for (let m of list) {
                markets = markets.update(m.market, Map(m).set('state', 0).set('symbols', List()), (s) => {
                    if (state) {
                        s = s.set('state', 1)
                    }
                    let symbols = s.get('symbols');
                    symbols = symbols.push(Map({
                        symbol: symbol.get('symbol'),
                        name: symbol.get('display_name'),
                        state: state
                    }))
                    s = s.set('symbols', symbols);
                    return s;
                });
            }
        }
        return markets;
    }

    /**
     * Returns ordered markets. Markets order is taken from /config.json
     *
     * @method getMarkets
     * @param {0|1} only_opened
     * @return {List()}
        [
            Map({
                market: 'random',
                name: 'Randoms',
                state: 1,
                is_sub: 0
            }),
            ...,
            Map({
                market: 'random_index',
                name: 'Indices',
                state: 1,
                is_sub: 1
            })
        ]
     */
    getMarkets(only_opened) {
        let markets = List();
        this._tree.sort((a, b) => {
            return config.markets_order[a.get('market')] - config.markets_order[b.get('market')]
        }).forEach((a) => {
            let row = Map({
                market: a.get('market'),
                name: a.get('name'),
                state: a.get('state'),
                is_sub: a.get('is_sub')
            });
            markets = markets.push(row);
        });

        if (only_opened) {
            markets = markets.filter(f => f.get('state'));
        }

        return markets;
    }

    /**
     * Returns symbols for market.
     *
     * @method getSymbols
     * @param {String} market_name
     * @return {List()}  
        [
             Map({
                 "symbol": "R_100",
                 "name": "Random 100 Index",
                 "state": 1
             }),
             ....,
             Map({
                 "symbol": "R_25",
                 "name": "Random 25 Index",
                 "state": 1
             })
        ]     
     */
    getSymbols(s) {
        return this._tree.getIn([s, 'symbols']);
    }
}

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
import Immutable, {
    List, Map, fromJS
}
from 'immutable';

export default class SymbolsParser {

    /**
     * @method constructor
     * @param {Array} SYMBOLS
     */
    constructor(symbols) {
        const [tree, symbols_obj, error] = this._parse(symbols);
        Object.defineProperties(this, {
            _symbols: {
                get: () => symbols,
                set: () => {}
            },
            symbols: {
                get: () => symbols_obj,
                set: () => {}
            },
            tree: {
                get: () => tree,
                set: () => {}
            }
        });
        if (error) {
            Object.defineProperty(this, 'error', {
                get: () => error,
                set: () => {}
            })
        }
    }

    /**
     * @method _parse
     * @private
     * @param {Array} SYMBOLS
     * @return {Array} tree Map(), symbols Map()
     */
    _parse(s) {
        const symbols = fromJS(s);
        let markets = Map();
        let symbols_obj = Map();
        let error = '';
        if (List.isList(symbols)) {
            symbols.forEach((s) => {
                markets = this._addSymbolToTree(markets, s);
                symbols_obj = this._addSymbolToList(symbols_obj, s);
            });
        }
        let result = [markets, symbols_obj];
        if (markets.isEmpty()) {
            result.push('Error parsing');
        }
        return result;
    }

    /**
     * @method _sortSymbolsList
     * @private
     * @param {List()} SYMBOLS
     * @return {List()} SYMBOLS
     */
    _sortSymbolsList(symbols = List()) {
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
     * @private
     * @param {Map()} MARKETS
     * @param {Map()} SYMBOL
     * @return {Map()} matkets with symbol added    
     */
    _addSymbolToTree(markets = Map(), symbol) {
        if (Map.isMap(symbol) && symbol.has('is_trading_suspended') && symbol.has('exchange_is_open') && symbol.get('market') && symbol.get('market_display_name') && symbol.get('submarket_display_name') && symbol.get('submarket') && symbol.get('symbol') && symbol.get('display_name')) {
            const state = !symbol.get('is_trading_suspended') && symbol.get('exchange_is_open');
            const list = [{
                market: symbol.get('market'),
                name: symbol.get('market_display_name'),
                is_sub: 0
            }, {
                market: symbol.get('submarket'),
                name: symbol.get('submarket_display_name'),
                is_sub: 1
            }, ];

            for (let m of list) {
                markets = markets.update(m.market, Map(m).set('state', 0), (s) => {
                    if (state) {
                        s = s.set('state', 1)
                    }
                    s = s.setIn(['symbols', symbol.get('symbol')], Map({
                        symbol: symbol.get('symbol'),
                        submarket: symbol.get('submarket'),
                        name: symbol.get('display_name'),
                        state: state
                    }));
                    return s;
                });
            }
        }
        return markets;
    }

    /**
     * Adds symbol symbols Map()
     *
     * @method _addSymbolToList
     * @private
     * @param {Map()} SYMBOL_OBJ
     * @param {Map()} SYMBOL
     * @return {Map()} symbols Map() with symbol added 
     */
    _addSymbolToList(symbols_obj = Map(), symbol) {
        if (Map.isMap(symbol) && symbol.has('is_trading_suspended') && symbol.has('exchange_is_open') && symbol.get('market') && symbol.get('market_display_name') && symbol.get('submarket_display_name') && symbol.get('submarket') && symbol.get('symbol') && symbol.get('display_name')) {
            const state = !symbol.get('is_trading_suspended') && symbol.get('exchange_is_open');
            symbols_obj = symbols_obj.set(symbol.get('symbol'), symbol.set('state', state));
        }

        return symbols_obj;
    }

    /**
     * Returns ordered markets. Markets order is taken from /config.json
     *
     * @method getMarkets
     * @param {0|1} ONLY_OPENED
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
    getMarkets(only_opened = 0) {
        let markets = List();
        this.tree.sort((a, b) => {
            return config.markets_order[a.get('market')] - config.markets_order[b.get('market')]
        }).forEach((a) => {
            const row = Map({
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
     * Returns first opened market.
     *
     * @method getFirstActiveMarket
     * @return {Map} Market details    
     */
    getFirstActiveMarket() {
        const opened_markets = this.getMarkets(1);
        if (!opened_markets.isEmpty()) {
            return opened_markets.get(0);
        } else {
            return;
        }
    }

    /**
     * Returns symbols for market.
     *
     * @method getSymbol
     * @param {String} SYMBOL
     * @return {Map} SYMBOL details     
     */
    getSymbol(symbol) {
        return this.symbols.get(symbol);
    }

    /**
     * Returns symbols for market.
     *
     * @method getSymbols
     * @param {String} MARKET
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
    getSymbols(market) {
        const symbols_obj = this.tree.getIn([market, 'symbols']);
        if (symbols_obj) {
            const sorted_symbols = this._sortSymbolsList(symbols_obj.toList());
            const result_symbols = sorted_symbols.map(symbol => symbol.delete('submarket'));
            return result_symbols;
        } else {
            return List();
        }
    }

    /**
     * Returns first active symbol for market.
     *
     * @method getFirstActiveSymbol
     * @param {String} MARKET
     * @return {Map} SYMBOL details    
     */
    getFirstActiveSymbol(market) {
        let symbols = this.getSymbols(market).filter((symbol) => symbol.get('state'));
        if (symbols.first()) {
            return this.symbols.get(symbols.first().get('symbol'));
        } else {
            return;
        }
    }

    /**
     * Check if symbol exists and is active
     *
     * @method isSymbolActive
     * @param {String} SYMBOL
     * @return {Bool}     
     */
    isSymbolActive(symbol) {
        return this.symbols.getIn([symbol, 'state']) ? 1 : 0;
    }

    /**
     * Returns true if market exists and opened and false if not.
     *
     * @method isMarketOpened
     * @param {String} MARKET
     * @return {Bool}      
     */
    isMarketOpened(market) {
        return this.tree.getIn([market, 'state']) ? 1 : 0;
    }
}

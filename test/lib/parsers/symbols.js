import {
    expect
}
from 'chai';
import {
    List, Map, fromJS
}
from 'immutable';
import SymbolsParser from '../../../lib/parsers/symbols';
import response from '../../receive/active_symbols';

describe('SymbolsParser Class tests', () => {
    let parsed = new SymbolsParser(response.active_symbols);

    it('Sort symbols', () => {

        expect(parsed._sortSymbolsList(List())).to.equal(List());
        expect(parsed._sortSymbolsList()).to.equal(List());

        let list = [{
            submarket: 'smart_fx',
            display_name: "USD Index"
        }, {
            submarket: 'major_pairs',
            display_name: "AUD/JPY"
        }, {
            submarket: 'smart_fx',
            display_name: "AUD Index"
        }, {
            submarket: 'smart_fx',
            display_name: "GBP Index"
        }];
        let new_list = parsed._sortSymbolsList(fromJS(list));
        expect(new_list).to.equal(fromJS([{
            submarket: 'major_pairs',
            display_name: "AUD/JPY"
        }, {
            submarket: 'smart_fx',
            display_name: "AUD Index"
        }, {
            submarket: 'smart_fx',
            display_name: "GBP Index"
        }, {
            submarket: 'smart_fx',
            display_name: "USD Index"
        }]));
    });

    let markets = parsed.getMarkets();
    it('get Markets list (ordered)', () => {
        expect(markets).to.equal(List([
            Map({
                market: 'forex',
                name: 'Forex',
                state: 0,
                is_sub: 0
            }),
            Map({
                market: 'major_pairs',
                name: 'Major Pairs',
                state: 0,
                is_sub: 1
            }),
            Map({
                market: 'smart_fx',
                name: 'Smart FX',
                state: 0,
                is_sub: 1
            }),
            Map({
                market: 'random',
                name: 'Randoms',
                state: 1,
                is_sub: 0
            }),
            Map({
                market: 'random_index',
                name: 'Indices',
                state: 1,
                is_sub: 1
            }),
            Map({
                market: 'random_daily',
                name: 'Quotidians',
                state: 1,
                is_sub: 1
            }),
            Map({
                market: 'random_nightly',
                name: 'Nocturnes',
                state: 1,
                is_sub: 1
            })
        ]));
    });

    let opened_markets = parsed.getMarkets(1);
    it('get Opened markets list (ordered)', () => {
        expect(opened_markets).to.equal(List([
            Map({
                market: 'random',
                name: 'Randoms',
                state: 1,
                is_sub: 0
            }),
            Map({
                market: 'random_index',
                name: 'Indices',
                state: 1,
                is_sub: 1
            }),
            Map({
                market: 'random_daily',
                name: 'Quotidians',
                state: 1,
                is_sub: 1
            }),
            Map({
                market: 'random_nightly',
                name: 'Nocturnes',
                state: 1,
                is_sub: 1
            })
        ]));
    });

    let random_symbols = parsed.getSymbols('random');
    it('get Market\'s  symbols list (ordered)', () => {
        expect(random_symbols).to.equal(List([
            Map({
                "symbol": "R_100",
                "name": "Random 100 Index",
                "state": 1
            }),
            Map({
                "symbol": "R_25",
                "name": "Random 25 Index",
                "state": 1
            }),
            Map({
                "symbol": "R_50",
                "name": "Random 50 Index",
                "state": 1
            }),
            Map({
                "symbol": "RDBULL",
                "name": "Random Bull",
                "state": 1
            }),
            Map({
                "symbol": "RDYANG",
                "name": "Random Yang",
                "state": 1
            })
        ]));

        expect(parsed.getSymbols('non existing market')).to.equal(List());
        expect(parsed.getSymbols()).to.equal(List());
    });

    it('Get first active symbol for market', () => {
        expect(parsed.getFirstActiveSymbol()).to.equal();
        expect(parsed.getFirstActiveSymbol('random')).to.equal(Map({
            "symbol_type": "stockindex",
            "exchange_is_open": 1,
            "is_trading_suspended": 0,
            "display_name": "Random 100 Index",
            "submarket_display_name": "Indices",
            "market_display_name": "Randoms",
            "state": 1,
            "pip": "0.01",
            "symbol": "R_100",
            "market": "random",
            "submarket": "random_index"
        }));

    });

    it('Checks adding symbol to  tree', () => {

        expect(parsed._addSymbolToTree()).to.equal(Map());

        expect(parsed._addSymbolToTree(undefined, 'wrong symbol')).to.equal(Map());
        expect(parsed._addSymbolToTree(undefined, Map({
            "market": "random",
            "symbol": "R_100",
            "market_display_name": "Randoms",
            "symbol_type": "stockindex",
            "exchange_is_open": 1,
            "submarket": "random_index",
            "display_name": "Random 100 Index",
            "submarket_display_name": "Indices",
            "is_trading_suspended": 0,
            "pip": "0.01"
        }))).to.equal(fromJS({
            'random': {
                market: 'random',
                state: 1,
                name: "Randoms",
                is_sub: 0,
                symbols: {
                    R_100: {
                        symbol: 'R_100',
                        name: "Random 100 Index",
                        submarket: "random_index",
                        state: 1
                    }
                }
            },
            'random_index': {
                market: 'random_index',
                state: 1,
                name: "Indices",
                is_sub: 1,
                symbols: {
                    R_100: {
                        symbol: 'R_100',
                        name: "Random 100 Index",
                        submarket: "random_index",
                        state: 1
                    }
                }
            }
        }));
    });

    it('Checks if market is opened', () => {
        expect(parsed.isMarketOpened('random')).to.equal(1);
        expect(parsed.isMarketOpened('wrong_market')).to.equal(0);
        expect(parsed.isMarketOpened('forex')).to.equal(0);
    });

    it('Checks if symbol is active', () => {
        expect(parsed.isSymbolActive('R_50')).to.equal(1);
        expect(parsed.isMarketOpened('WLDGBP')).to.equal(0);
        expect(parsed.isMarketOpened('non existing')).to.equal(0);
    });

    it('Gets first active market', () => {
        expect(parsed.getFirstActiveMarket()).to.equal(Map({
            market: 'random',
            name: 'Randoms',
            state: 1,
            is_sub: 0
        }));
        expect((new SymbolsParser).getFirstActiveMarket()).to.equal();
    });

})

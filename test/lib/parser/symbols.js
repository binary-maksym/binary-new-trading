import {
    expect
}
from 'chai';
import {
    List, Map, fromJS
}
from 'immutable';
import SymbolsParser from '../../../lib/parser/symbols';
import response from '../../receive/active_symbols'

describe('SymbolsParser Class tests', () => {
    let parsed = new SymbolsParser(response.active_symbols);

    it('Sort symbols', () => {
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
    })

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
    })

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
    })
})

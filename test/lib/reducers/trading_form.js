import Reducer from '../../../lib/reducers/trading_form';
import {
    expect
}
from 'chai';
import {
    List, Map, fromJS
}
from 'immutable';
import active_symbols from '../../receive/active_symbols';
import Parser from '../../../lib/parsers/symbols';

describe('TradingFormReducers tests', () => {

    it('Empty reducer and empty action', () => {
        expect(Reducer()).to.equal(Map());
    });

    it('Bad action', () => {
        expect(Reducer(undefined, {
            TYPE: 'BAD_ACTION'
        })).to.equal(Map());
    });


    it('PENDING_SYMBOLS actions processing', () => {

        let first_state = Map();
        let promise = new Promise((a, b) => {});
        let action = {
            type: 'PENDING_SYMBOLS',
            promise
        };
        let expected_state = fromJS({
            symbols: {
                status: 'pending',
                dispatched: promise
            }
        });
        let new_state = Reducer(Map(), action);
        expect(new_state).to.equal(expected_state);


        promise = new Promise((a, b) => {});
        let action2 = {
            type: 'PENDING_SYMBOLS',
            promise
        };
        let expected_state2 = fromJS({
            symbols: {
                status: 'pending',
                dispatched: promise
            }
        });
        let new_state2 = Reducer(new_state, action2);
        expect(new_state2).to.equal(expected_state2);


        let new_state3 = Reducer(Map(), {
            type: 'PENDING_SYMBOLS'
        });
        expect(new_state3).to.equal(Map());
    });

    it('SUCCESS_SYMBOLS actions processing', () => {
        let first_state = fromJS({
            symbols: {
                status: 'pending',
                dispatched: (new Promise((a, b) => {}))
            }
        });
        let action = {
            type: 'SUCCESS_SYMBOLS'
        };
        expect(Reducer(first_state, action)).to.equal(fromJS({
            symbols: {
                status: 'error',
                error: 'Error parsing'
            }
        }));
        let action2 = {
            type: 'SUCCESS_SYMBOLS',
            data: 'wrong response'
        };
        expect(Reducer(first_state, action2)).to.equal(fromJS({
            symbols: {
                status: 'error',
                error: 'Error parsing'
            }
        }));

        let action3 = {
            type: 'SUCCESS_SYMBOLS',
            data: active_symbols.active_symbols
        };
        let parser = new Parser(active_symbols.active_symbols);
        let new_state = Reducer(first_state, action3);

        expect(new_state.getIn(['symbols', 'data']).tree).to.eql(parser.tree);
        expect(new_state.getIn(['symbols', 'status'])).to.equal('ready');
    });

    it("SET_MARKET action processing", () => {
        let state1 = Map();
        let action1 = {
            type: 'SET_MARKET'
        }
        let next_state1 = Reducer(state1, action1);
        expect(next_state1).to.equal(state1);

        let parsed = new Parser(active_symbols.active_symbols);
        let state2 = Map(fromJS({
            storage: {
                market: 'random'
            },
            symbols: {
                status: 'ready',
                data: parsed
            }
        }));
        let action2 = {
            type: 'SET_MARKET'
        }
        let next_state2 = Reducer(state2, action2);
        expect(next_state2.get('market')).to.equal('random');

        let state3 = Map(fromJS({
            storage: {
                market: 'forex'
            },
            symbols: {
                status: 'ready',
                data: parsed
            }
        }));
        let action3 = {
            type: 'SET_MARKET'
        };
        let next_state3 = Reducer(state3, action3);
        expect(next_state3.get('market')).to.equal('random');
        expect(next_state3.getIn(['storage', 'market'])).to.equal('random');
        let action4 = {
            type: 'SET_MARKET',
            market: 'forex'
        };
        let next_state4 = Reducer(next_state3, action4);
        expect(next_state4.get('market')).to.equal('random');
        expect(next_state4.getIn(['storage', 'market'])).to.equal('random');

        let state5 = Map(fromJS({
            symbols: {
                status: 'ready',
                data: parsed
            }
        }));
        let action5 = {
            type: 'SET_MARKET',
            market: 'random'
        };
        let next_state5 = Reducer(state5, action5);
        expect(next_state5.get('market')).to.equal('random');
        expect(next_state4.getIn(['storage', 'market'])).to.equal('random');


    });

});

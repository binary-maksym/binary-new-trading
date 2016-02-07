import {
    expect
}
from 'chai';
import {
    List, Map
}
from 'immutable';
import ContractsParser from '../../../lib/parsers/contracts';
import ContractsParserPatched from '../../../lib/parsers/contracts_patched';
import response from '../../receive/contracts_for_symbol'
import util from 'util';

describe('ContractsParser Class tests', () => {

    const parsed = new ContractsParser(response.contracts_for.available);

    it('Adding data to tree', () => {
        let tree = Map();
        let next_tree = parsed._addDataToTree(tree, Map({
            "contract_display": "asian up",
            "market": "random",
            "max_contract_duration": "10t",
            "payout_limit": "10000",
            "barrier_category": "asian",
            "exchange_name": "RANDOM",
            "submarket": "random_index",
            "contract_category_display": "Asians",
            "contract_type": "ASIANU",
            "min_contract_duration": "5t",
            "sentiment": "up",
            "barriers": 0,
            "contract_category": "asian",
            "start_type": "spot",
            "expiry_type": "tick",
            "underlying_symbol": "R_100"
        }));
        expect(next_tree).to.equal(Map({
            "asian": Map({
                "name": "Asians",
                "start_types": Map({
                    "spot": Map({
                        "t": Map({
                            "min_duration": "5t",
                            "max_duration": "10t"
                        })
                    })
                })
            })
        }));
    });

    it('Durations completing', () => {
        let durations = Map({
            "d": Map({
                "min_duration": "1d",
                "max_duration": "365d",
                "barrier": "+1462.51"
            }),
            "s": Map({
                "min_duration": "15s",
                "max_duration": "1d"
            })
        });
        let durations_next = parsed._completeDurations(durations);
        expect(durations_next).to.equal(Map({
            "d": Map({
                "min_duration": "1d",
                "max_duration": "365d",
                "barrier": "+1462.51"
            }),
            "s": Map({
                "min_duration": "15s",
                "max_duration": "1d"
            }),
            "m": Map({
                "min_duration": "1m",
                "max_duration": "1d"
            }),
            "h": Map({
                "min_duration": "1h",
                "max_duration": "1d"
            })
        }));
    });

    it('Get sorted Categories', () => {
        let categories = parsed.getCategories();
        expect(categories).to.equal(List([
            Map({
                "category": "callput",
                "name": "Up/Down"
            }),
            Map({
                "category": "touchnotouch",
                "name": "Touch/No Touch"
            }),
            Map({
                "category": "endsinout",
                "name": "Ends In/Out"
            }),
            Map({
                "category": "staysinout",
                "name": "Stays In/Goes Out"
            }),
            Map({
                "category": "asian",
                "name": "Asians"
            }),
            Map({
                "category": "digits",
                "name": "Digits"
            }),
            Map({
                "category": "spreads",
                "name": "Spreads"
            })
        ]));
    });

    it('Get Start Types', () => {
        let start_types = parsed.getStartTypes('callput');
        expect(start_types).to.equal(Map({
            spot: 1,
            forward: 1
        }));

        let start_types2 = parsed.getStartTypes('digits');
        expect(start_types2).to.equal(Map({
            spot: 1
        }));
    });

    it('Checking adding patched callput contracts to the tree', () => {
        const parsed = new ContractsParserPatched(response.contracts_for.available);
        let tree = Map();
        let next_tree = parsed._addDataToTree(tree, Map({
            "contract_display": "higher",
            "market": "random",
            "min_contract_duration": "1d",
            "max_contract_duration": "365d",
            "sentiment": "up",
            "barriers": 0,
            "contract_category": "callput",
            "start_type": "spot",
            "barrier_category": "euro_atm",
            "exchange_name": "RANDOM",
            "submarket": "random_index",
            "expiry_type": "daily",
            "underlying_symbol": "R_100",
            "contract_category_display": "Up/Down",
            "contract_type": "CALL"
        }));
        next_tree = parsed._addDataToTree(next_tree, Map({
            "contract_display": "higher",
            "market": "random",
            "max_contract_duration": "365d",
            "barrier": "+1462.51",
            "barrier_category": "euro_non_atm",
            "exchange_name": "RANDOM",
            "submarket": "random_index",
            "contract_category_display": "Up/Down",
            "contract_type": "CALL",
            "min_contract_duration": "1d",
            "sentiment": "up",
            "barriers": 1,
            "contract_category": "callput",
            "start_type": "spot",
            "expiry_type": "daily",
            "underlying_symbol": "R_100"
        }));

        expect(next_tree).to.equal(Map({
            "risefall": Map({
                "name": "Rise/Fall",
                "start_types": Map({
                    "spot": Map({
                        "d": Map({
                            "min_duration": "1d",
                            "max_duration": "365d"
                        })
                    })
                })
            }),
            "higherlower": Map({
                "name": "Higher/Lower",
                "start_types": Map({
                    "spot": Map({
                        "d": Map({
                            "min_duration": "1d",
                            "max_duration": "365d",
                            "barrier": "+1462.51"
                        })
                    })
                })
            })
        }));
    })
});

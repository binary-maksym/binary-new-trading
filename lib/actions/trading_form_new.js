import {
    WS_API
}
from '../middleware/socket';

import Queue from '../helpers/queue';

function TradingFormActions(store) {

    const queue = new Queue(store);
    let actions = {};

    const handleAction = action => {
        queue.add(action);
        if (queue.size === 1) {
            queue.next();
        }
    }

    const handleError = error => {
        queue.undo();
    }

    const getNextAction = action => {
        const form = store.getState().get('trading_form');
        const contracts = store.getState().getIn(['trading_form', 'contracts', 'data']);
        switch (action) {
            case 'setMarket':
                return 'setSymbol';
            case 'setSymbol':
                return 'setCategory';
            case 'setCategory':
                if (contracts.hasStartType(form.get('category'), 'forward')) {
                    return 'setStartTime';
                } else if (form.get('category') === 'spreads') {
                    return 'setStopType';
                } else {
                    return 'setExpiryType';
                }
            case 'setStartTime':
                return 'setExpiryType';
            case 'setExpiryType':
                if (form.get('expiry_type') === 'end_time') {
                    return 'setExpiryDate';
                } else {
                    return 'setDurationUnit';
                }
            case 'setExpiryDate':
                return 'setExpiryTime';
            case 'setDurationUnit':
                return 'setDurationAmount';
            case 'setExpiryTime':
                return 'setBarrier';
            case 'setDurationAmount':
                if (contracts.hasDigits(form.get('category'))) {
                    return 'setPrediction';
                } else {
                    return 'setBarrier';
                }
            case 'setPrediction':
                return 'setPayoutType';
            case 'setBarrier':
                const start_time = form.get('start_time') ? 'forward' : 'spot';
                const duration_unit = form.get('expiry_type') === 'end_time' ? 'd' : form.get('duration_unit');
                if (contracts.getBarriers(form.get('category'), start_time, duration_unit).size() === 2) {
                    return 'setBarrier2';
                } else {
                    return 'setPayoutType';
                }
            case 'setStopType':
                return 'setStopLoss';
            case 'setStopLoss':
                return 'setStopProfit';
            case 'setPayoutType':
                return 'setPayoutCurrency';
            case 'setPayoutCurrency':
                if (form.get('category') === 'spreads') {
                    return 'setPayoutAmmount';
                } else {
                    return 'setPayoutAmmountPerPoint';
                }
            default:
                return undefined;
        }
    }

    const getDispatcher = action => {
        if (typeof action === 'object' && action.type) {
            let match = type.match(/^([A-Z]+)_([A-Z])([A-Z]+)/);
            if (match) {
                const action_name = match[1].toLowerCase() + match[2].toUpperCase() + match[3].toLowerCase();
                dispatch(action).then(() => {
                    const next_action_name = getNextAction(action_name);
                    if (next_action_name) {
                        actions[next_action_name]();
                    } else {
                        queue.next();
                    }
                }).catch(error => {
                    handleError(error);
                });
            }
        }
    }

    actions.setMarket = market => {
        const dispatcher = getDispatcher({
            type: 'SET_MARKET',
            symbol
        });
        dispatcher();
    };

    actions.setSymbol = (symbol) => {

    };

    actions.setCategory = (category) => {

    };


    return Object.keys(actions).map(action => param => handleAction(() => actions[action](paaram)));
}

export default TradingFormActions;

import moment from 'moment';
import {
    WS_API
}
from '../middleware/socket';
import Queue from '../helpers/queue';

function TradingFormActions(store) {

    const queue = new Queue(store);
    let current_action;
    let actions = {};

    const handleAction = action => {
        queue.add(action);

        if (!current_action) {
            current_action = queue.next();
            current_action.start();
        }
    }

    const handleError = error => {
        console.log(error)
        queue.revert();
    }

    const getNextAction = action => {
        const form = store.getState().get('trading_form');
        const contracts = store.getState().getIn(['trading_form', 'contracts', 'data']);
        switch (action) {
            case 'setMarket':
                return 'setSymbol';
                // case 'setSymbol':
                //     return 'setCategory';
                // case 'setCategory':
                //     if (contracts.hasStartType(form.get('category'), 'forward')) {
                //         return 'setStartTime';
                //     } else if (form.get('category') === 'spreads') {
                //         return 'setStopType';
                //     } else {
                //         return 'setExpiryType';
                //     }
                // case 'setStartTime':
                //     return 'setExpiryType';
                // case 'setExpiryType':
                //     if (form.get('expiry_type') === 'end_time') {
                //         return 'setExpiryDate';
                //     } else {
                //         return 'setDurationUnit';
                //     }
                // case 'setExpiryDate':
                //     return 'setExpiryTime';
                // case 'setDurationUnit':
                //     return 'setDurationAmount';
                // case 'setExpiryTime':
                //     return 'setBarrier';
                // case 'setDurationAmount':
                //     if (contracts.hasDigits(form.get('category'))) {
                //         return 'setPrediction';
                //     } else {
                //         return 'setBarrier';
                //     }
                // case 'setPrediction':
                //     return 'setPayoutType';
                // case 'setBarrier':
                //     const start_time = form.get('start_time') ? 'forward' : 'spot';
                //     const duration_unit = form.get('expiry_type') === 'end_time' ? 'd' : form.get('duration_unit');
                //     if (contracts.getBarriers(form.get('category'), start_time, duration_unit).size() === 2) {
                //         return 'setBarrier2';
                //     } else {
                //         return 'setPayoutType';
                //     }
                // case 'setStopType':
                //     return 'setStopLoss';
                // case 'setStopLoss':
                //     return 'setStopProfit';
                // case 'setPayoutType':
                //     return 'setPayoutCurrency';
                // case 'setPayoutCurrency':
                //     if (form.get('category') === 'spreads') {
                //         return 'setPayoutAmmount';
                //     } else {
                //         return 'setPayoutAmmountPerPoint';
                //     }
            default:
                return undefined;
        }
    }

    const getDispatcher = (action) => {
        if (typeof action === 'object' && action.type) {
            let match = action.type.match(/^([A-Z]+)_([A-Z])([A-Z]+)/);
            if (match) {
                const action_name = match[1].toLowerCase() + match[2].toUpperCase() + match[3].toLowerCase();

                return () => store.dispatch(action).then(() => {
                    const next_action_name = getNextAction(action_name);
                    if (next_action_name) {
                        actions[next_action_name]();
                    } else {
                        current_action.finish();
                        current_action = queue.next();
                        current_action.start();
                    }
                }).catch(error => {
                    handleError(error);
                });
            }
        }
    }

    const getSymols = () => {
        let promise = Promise.resolve();
        const last_req_time = store.getState().getIn(['trading_form', 'symbols', 'time']);

        if (!last_req_time || moment(last_req_time).diff(moment(), 'seconds') > 15) {
            promise = store.dispatch({
                [WS_API]: {
                    types: ['PENDING_SYMBOLS', 'SUCCESS_SYMBOLS', 'FAILURE_SYMBOLS'],
                    active_symbols: 'brief'
                }
            });
        }

        return promise;
    }

    actions.setMarket = market => {
        const dispatcher = getDispatcher({
            type: 'SET_MARKET',
            market
        });
        getSymols().then(() => dispatcher()).catch(error => handleError(error));
    };

    actions.setSymbol = symbol => {
        const dispatcher = getDispatcher({
            type: 'SET_SYMBOL',
            symbol
        });
        getSymols().then(() => dispatcher()).catch(error => handleError(error));
    };

    actions.setCategory = (category) => {
        // const dispatcher = getDispatcher({
        //     type: 'SET_SYMBOL',
        //     symbol
        // });
    };

    const generateActionsList = () => {
        let result = {};
        for (let action of Object.keys(actions)) {
            result[action] = param => handleAction(() => actions[action](param))
        }
        return result;
    }

    return generateActionsList();
}

export default TradingFormActions;

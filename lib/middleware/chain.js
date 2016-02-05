const ACTIONS_MAP = {
    setMarket: [
        'setSymbol'
    ],
    setSymbol: [
        'setStartTime',
        'setExpiryType',
        'setStopType'
    ],
    setStartTime: [
        'setExpiryType'
    ],
    setExpiryType: [
        'setStartDate',
        'setDurationUnit'
    ],
    setStartDate: [
        'setStartTime'
    ],
    setDurationUnit: [
        'setDurationAmount'
    ],
    setStartTime: [
        'setBarrier'
    ],
    setDurationAmount: [
        'setBarrier',
        'setPrediction',
    ],
    setPrediction: [
        'setPayoutType'
    ],
    setBarrier: [
        'setBarrier2',
        'setPayoutType'
    ],
    setStopType: [
        'setStopLoss'
    ],
    setStopLoss: [
        'setStopProfit'
    ],
    setPayoutType: [
        'setPayoutCurrency'
    ],
    setPayoutCurrency: [
        'setPayoutAmmount',
        'setPayoutAmmountPerPoint'
    ]
};

import action_creators from '../actions/core';

const transformActionType = (type) => {
    let match = type.match(/^([A-Z]+)_([A-Z])([A-Z]+)/);
    if (match) {
        return match[1].toLowerCase() + match[2].toUpperCase() + match[3].toLowerCase();
    }
}

export default store => next => action => {

    let result = next(action);
    let action_creator = transformActionType(action.type);
    if (ACTIONS_MAP[action_creator] && ACTIONS_MAP[action_creator][0] && action_creators[ACTIONS_MAP[action_creator][0]]) {
        store.dispatch(action_creators[ACTIONS_MAP[action_creator][0]]());
    }
    return Promise.resolve();
}

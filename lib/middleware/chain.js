/**
 * Middleware checks for potential actionCreator that should be dispathed after current action and dispatches it if exists.
 *
 * Actions types and action creators should have the same style, for example "SET_SYMBOL" for action type and "setSymbol" for action creator.
 *
 * @class ChainMiddleware
 * @constructor
 *
 */


const ACTIONS_MAP = {
    setMarket: [
        'setSymbol'
    ],
    setSymbol: [
        'setCategory'
    ],
    setCategory: [
        'setStartTime',
        'setExpiryType',
        'setStopType'
    ],
    setStartTime: [
        'setExpiryType'
    ],
    setExpiryType: [
        'setExpiryDate',
        'setDurationUnit'
    ],
    setExpiryDate: [
        'setExpiryTime'
    ],
    setDurationUnit: [
        'setDurationAmount'
    ],
    setExpiryTime: [
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

const ChainMiddleware = store => next => action => {

    let result = next(action);
    // return result;
    // Executing chain after 1 millisecond to make possible returning correct Promise for parent action
    setTimeout(() => {
        let action_creator = transformActionType(action.type);
        if (ACTIONS_MAP[action_creator] && ACTIONS_MAP[action_creator][0] && action_creators[ACTIONS_MAP[action_creator][0]]) {
            store.dispatch(action_creators[ACTIONS_MAP[action_creator][0]]());
        }
    }, 1);

    return result;
};

export default ChainMiddleware;

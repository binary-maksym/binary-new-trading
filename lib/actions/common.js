export const SELECT_MARKET = 'SELECT_MARKET'
export const SELECT_SYMBOL = 'SELECT_SYMBOL'
export const SELECT_CATEGORY = 'SELECT_CATEGORY'
export const SELECT_START_TIME = 'SELECT_START_TIME'
export const SELECT_EXPIRY_TYPE = 'SELECT_EXPIRY_TYPE'
export const SELECT_DURATION_AMOUNT = 'SELECT_DURATION_AMOUNT'
export const SELECT_DURATION_UNIT = 'SELECT_DURATION_UNIT'
export const SELECT_EXPIRY_DATE = 'SELECT_EXPIRY_DATE'
export const SELECT_EXPIRY_TIME = 'SELECT_EXPIRY_TIME'
export const SELECT_BARRIER = 'SELECT_BARRIER'
export const SELECT_LOW_BARRIER = 'SELECT_LOW_BARRIER'
export const SELECT_HIGH_BARRIER = 'SELECT_HIGH_BARRIER'
export const SELECT_PREDICTION = 'SELECT_PREDICTION'
export const SELECT_STOP_TYPE = 'SELECT_STOP_TYPE'
export const SELECT_STOP_LOSS = 'SELECT_STOP_LOSS'
export const SELECT_STOP_PROFIT = 'SELECT_STOP_PROFIT'
export const SELECT_AMOUNT_TYPE = 'SELECT_AMOUNT_TYPE'
export const SELECT_AMOUNT = 'SELECT_AMOUNT'
export const SELECT_PER_POINT = 'SELECT_PER_POINT'
export const BUY = 'BUY'




export const ACTIONS_MAP = {
    setMarket: [
        'setSymbol'
    ],
    setSymbol: [
            'setStartTime',
            'setExpiryType',
            'setStopType'
        ]
        // setStartTime: [
        //     'setExpiryType'
        // ],
        // setExpiryType: [
        //     'setStartDate',
        //     'setDurationUnit'
        // ],
        // setStartDate: [
        //     'setStartTime'
        // ],
        // setDurationUnit: [
        //     'setDurationAmount'
        // ],
        // setStartTime: [
        //     'setBarrier'
        // ],
        // setDurationAmount: [
        //     'setBarrier',
        //     'setPrediction',
        // ],
        // setPrediction: [
        //     'setPayoutType'
        // ],
        // setBarrier: [
        //     'setBarrier2',
        //     'setPayoutType'
        // ],
        // setStopType: [
        //     'setStopLoss'
        // ],
        // setStopLoss: [
        //     'setStopProfit'
        // ],
        // setPayoutType: [
        //     'setPayoutCurrency'
        // ],
        // setPayoutCurrency: [
        //     'setPayoutAmmount',
        //     'setPayoutAmmountPerPoint'
        // ]
};

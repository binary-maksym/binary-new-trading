import Immutable from 'immutable';

const ERRORS = {

    ERROR_SYMBOLS_PARSING: {
        code: 'ErrorSymbolParsing',
        error: 'Error while parsing active symbols response'
    },
    ERROR_MARKET_CLOSED: {
        code: 'ErrorMarketClosed',
        error: 'This market is closed'
    },
    ERROR_ALL_MARKETS_CLOSED: {
        code: 'ErrorAllMarketsClosed',
        error: 'At current moment all the markets are closed'
    },
    ERROR_SYMBOLS_NOT_LOADED: {
        code: 'ErrorSymbolsNotLoaded',
        error: 'Active symbols request has no response yet'
    },
    ERROR_MARKET_NOT_SELECTED: {
        code: 'ErrorMarketNotSelected',
        error: 'Market should be selected before symbol'
    },
    ERROR_SYMBOL_IS_CLOSED: {
        code: 'ErrorSymbolIsClosed',
        error: 'Trading on Symbol is closed'
    },
    ERROR_WRONG_SYMBOL_MARKET: {
        code: 'ErrorWrongSymbolMarket',
        error: 'Symbol is from another market'
    },
    ERROR_WRONG_CONTRACT_SYMBOL_ASKED: {
        code: 'ErrorWrongContractSymbolAsked',
        error: 'Contracts_for request should be for current selected symbol'
    },

    ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE: {},

    ERROR_WRONG_SYMBOL_PASSED: {},

    ERROR_CONTRACTS_NOT_LOADED: {}

}

export default (error) => typeof ERRORS[error] === 'object' ? Immutable.fromJS(ERRORS[error]) : Immutable.fromJS({
    code: 'error',
    message: 'Error'
});

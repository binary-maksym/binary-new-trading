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

    ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE: {
        code: 'ErrorContractsForRequstFirst',
        error: 'contracts_for request should come before processing resopnse'
    },

    ERROR_WRONG_SYMBOL_PASSED: {
        code: 'ErrorWrongSymbolPassed',
        error: 'Response symbol should be the same as ask one for contracts_for request'
    },

    ERROR_CONTRACTS_NOT_LOADED: {
        code: 'ErrorContractsNotLoaded',
        error: 'Contracts_for request should be done first'
    },

    ERROR_NOT_SELECTED: {
        error: 'Symbol should be selected first'
    },
    ERROR_CONTRACTS_PARSING: {
        error: 'Error parsing contracts'

    }


}

export default (error) => typeof ERRORS[error] === 'object' ? Immutable.fromJS(ERRORS[error]) : Immutable.fromJS({
    code: 'error',
    message: 'Error'
});

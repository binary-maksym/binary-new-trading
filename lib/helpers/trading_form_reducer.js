export const checkForSymbolsLoadedError = state => {
    if (state.getIn(['symbols', 'status']) !== 'ready') {
        return 'ERROR_SYMBOLS_NOT_LOADED';
    }
}

export const checkForMarketError = state => {
    const symbols_loaded_err = checkForSymbolsLoadedError(state);
    if (!symbols_loaded_err) {
        const market = state.get('market');
        const parsed = state.getIn(['symbols', 'data']);
        if (!market) {
            return 'ERROR_MARKET_NOT_SELECTED';
        } else if (!parsed.isMarketOpened(market)) {
            return 'ERROR_MARKET_CLOSED';
        }
    } else {
        return symbols_loaded_err;
    }
}

export const checkForSymbolError = state => {
    const market_error = checkForMarketError(state);
    if (!market_error) {
        const market = state.get('market');
        const symbol = state.get('symbol');
        const parsed = state.getIn(['symbols', 'data']);

        if (parsed.isSymbolActive(symbol)) {
            const symbol_details = parsed.getSymbol(symbol);
            if (!(symbol_details.get('market') === market || symbol_details.get('submarket') === market)) {
                return 'ERROR_WRONG_SYMBOL_MARKET';
            }
        } else {
            return 'ERROR_SYMBOL_IS_CLOSED';
        }

    } else {
        return market_error;
    }
}

export const checkContractsLoaded = state => {
    if (state.getIn(['contracts', 'status']) !== 'ready') {
        return 'ERROR_CONTRACTS_NOT_LOADED';
    }
}

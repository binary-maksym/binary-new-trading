import Props from './props'
import Market from './market'

export default class Symbol1 extends Props {

  static getId() {
    return 'symbol'
  }

  static getActionName() {
    return 'setSymbol'
  }


  static nextProps() {
    return []
      // return ['Category']
  }

  static nextProp() {
    return
    // return 'Category'
  }

  static getAction(value) {
    return {
      type: 'SET_SYMBOL',
      value
    }
  }

  static getDefault(state) {

    let symbol
    let error

    const parsed = state.getIn(['symbols', 'data'])

    const stored_symbol = state.getIn(['storage', Symbol1.getId()])
    const stored_symbol_details = parsed.getSymbol(stored_symbol)

    if (stored_symbol &&
      stored_symbol_details &&
      stored_symbol_details.get('state') &&
      (stored_symbol_details.get('market') === market || stored_symbol_details.get('submarket') === market)) {
      symbol = stored_symbol
    } else {
      const first_opened_symbol = parsed.getFirstOpenedSymbol(market)
      symbol = first_opened_symbol.get('symbol')
    }

    return [symbol, error]
  }

  static setValue(state, value) {

    if (state.getIn(['symbols', 'status']) === 'ready') {
      const market = state.get(Market.getId())
      if (market) {
        const parsed = state.getIn(['symbols', 'data'])
        if (value) {
          if (parsed.isSymbolOpened(value)) {
            state = super.setProp(state, Symbol1, value)
          } else {
            state = super.setError(state, 'ERROR_SYMBOL_IS_CLOSED')
          }
        } else {
          // Set up default symbol
          state = !error ? super.setProp(state, Symbol1, defaultMarket) : super.setError(state, error)
        }
      } else {
        state = super.setError(state, 'ERROR_MARKET_NOT_SELECTED')
      }

    } else {
      state = super.setError(state, 'ERROR_SYMBOLS_NOT_LOADED')
    }

    return state
  }


}
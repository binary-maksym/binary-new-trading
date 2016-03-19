import Props from './props'
import Symbol1 from './symbol'

export default class Market extends Props {

  static getId() {
    return 'market'
  }

  static getActionName() {
    return 'setMarket'
  }

  static nextProps() {
    return [Symbol1]
  }

  static nextProp() {
    return Symbol1
  }

  static getAction(value) {
    return {
      type: 'SET_MARKET',
      value
    }
  }

  static getDefault(state) {

    let market
    let error
    const parsed = state.getIn(['symbols', 'data'])
    if (state.getIn(['storage', Market.getId()]) && parsed.isMarketOpened(state.getIn(['storage', Market.getId()]))) {
      market = state.getIn(['storage', Market.getId()])
    } else {
      const first_opened_market = parsed.getFirstOpenedMarket()
      if (first_opened_market && first_opened_market.get(Market.getId())) {
        market = first_opened_market.get(Market.getId())
      } else {
        error = 'ERROR_ALL_MARKETS_CLOSED'
      }
    }

    return [market, error]
  }

  static setValue(state, value) {

    if (state.getIn(['symbols', 'status']) === 'ready') {
      const parsed = state.getIn(['symbols', 'data'])
      if (value) {
        if (parsed.isMarketOpened(value)) {
          state = super.setProp(state, Market, value)
        } else {
          state = super.setError(state, 'ERROR_MARKET_CLOSED')
        }
      } else {
        // Set up default market
        const [defaultMarket, error] = Market.getDefault(state)
        state = !error ? super.setProp(state, Market, defaultMarket) : super.setError(state, error)
      }
    } else {
      state = super.setError(state, 'ERROR_SYMBOLS_NOT_LOADED')
    }
    return state
  }


}
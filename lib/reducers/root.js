import TradingFormReducer from './trading_form'
import Immutable from 'immutable'

const initial_state = Immutable.fromJS({
  trading_form: {},
  error: {}
})

export default function RootReducer(state = initial_state, action) {

  let trading_form_state = state.get('trading_form').set('error', state.getIn(['error', 'trading_form']))
  let new_trading_form_state = TradingFormReducer(trading_form_state, action)
  let trading_form_error = new_trading_form_state.get('error')
  if (trading_form_error) {
    new_trading_form_state = new_trading_form_state.delete('error')
    state = state.setIn(['error', 'trading_form'], trading_form_error)
  }
  state = state.set('trading_form', new_trading_form_state)

  return state
}
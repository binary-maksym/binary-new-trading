import Immutable from 'immutable'
import * as actions_types from '../actions/actions_types'
import Err from '../helpers/errors'
import SymbolsParser from '../parsers/symbols'
import ContractsParser from '../parsers/contracts_patched'



import Market from '../helpers/trading_form_props/market'
import Symbol1 from '../helpers/trading_form_props/symbol'




const initialState = Immutable.Map()
export default (state = initialState, action = {}) => ActionsHandlers[actions_types[action.type]] ? ActionsHandlers[actions_types[action.type]](state, action) : state


class ActionsHandlers {

  static PENDING_SYMBOLS(state) {
    state = state.setIn(['symbols', 'status'], 'pending')
    return state
  }

  static FAILURE_SYMBOLS(state, action) {
    state = state.set('error', Immutable.fromJS(action.error)).setIn(['symbols', 'status'], 'error')
    return state
  }

  static SUCCESS_SYMBOLS(state, action) {

    const markets = action.data
    const parser = new SymbolsParser(markets)

    if (parser.error) {
      state = state.setIn(['symbols', 'status'], 'error')
      state = state.set('error', parser.error)
    } else {
      state = state.setIn(['symbols', 'data'], parser).setIn(['symbols', 'status'], 'ready').setIn(['symbols', 'time'], action.time)
    }

    return state
  }

  static SET_MARKET(state, action) {

    state = Market.setValue(state, action.value)
    return state
  }

  static SET_SYMBOL(state, action) {

    state = Symbol1.setValue(state, action.value)
    return state
  }

  static PENDING_CONTRACTS(state, action) {

    const setError = error => state.set('error', Err._(error))

    const symbol = state.get('symbol')

    if (symbol) {
      if (action.symbol === symbol) {
        state = state.set('contracts', Immutable.fromJS({
          status: 'pending',
          for_symbol: action.symbol
        }))
      } else {
        state = setError('ERROR_WRONG_CONTRACT_SYMBOL_ASKED')
      }
    } else {
      state = setError('ERROR_NOT_SELECTED')
    }

    return state
  }

  static FAILURE_CONTRACTS(state, action) {

    const setError = error => state.set('error', Err._(error))

    if (state.getIn(['contracts', 'status']) === 'pending') {
      if (state.getIn(['contracts', 'symbol']) === action.symbol) {
        state = state.set('contracts', Immutable.fromJS({
          status: 'error',
          for_symbol: action.symbol
        })).set('error', Immutable.fromJS(action.error))
      } else {
        state = setError('ERROR_WRONG_SYMBOL_PASSED')
      }
    } else {
      state = setError('ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE')
    }

    return state
  }

  static SUCCESS_CONTRACTS(state, action) {

    const setError = error => state.set('error', Err._(error))

    if (state.getIn(['contracts', 'status']) === 'pending') {
      if (state.getIn(['contracts', 'symbol']) === action.symbol) {

        const parser = new ContractsParser(action.data.available)

        if (!parser.error) {
          state = state.set('contracts', Immutable.fromJS({
            status: 'ready',
            for_symbol: action.symbol,
            data: parser
          }))
        } else {
          state = state.set('contracts', Immutable.fromJS({
            status: 'error',
            for_symbol: action.symbol
          })).set('error', parser.error)
        }
      } else {
        state = setError('ERROR_WRONG_SYMBOL_PASSED')
      }
    } else {
      state = setError('ERROR_CONTRACTS_FOR_REQUEST_SHOULD_BE_BEFORE')
    }

    return state
  }

  static SET_CATEGORY(state, action) {

    const setError = error => state.set('error', Err._(error));
    // const setCategory = category => {
    //     state
    //         .set('category', category)
    //         .setIn(['storage', 'category'], category)
    //         .delete('start_time')
    //         .delete('expiry_time')
    //         .delete('stop_type')
    //         .delete

    // }






    // if (state.getIn(['contracts', 'status']) === 'ready') {
    //     const category = action.category;
    //     const cotracts = state.getIn(['contracts', 'data']);
    //     if (cotracts.hasCategory(category)) {
    //         state = setCategory(category);
    //     } else {
    //         state = setError('ERROR_CATEGORY_DOESNT_EXIST');
    //     }
    // } else {
    //     state = setError('ERROR_CONTRACTS_NOT_LOADED');
    // }

    // return state;
  }

  // static SET_START_TIME(state, action) {

  //     const setError = error => state.set('error', Err._(error));
  //     const setStartTime = start_time => state.set('start_time', start_time).setIn(['storage', 'start_time'], start_time);


  //     if (state.getIn(['contracts', 'status']) === 'ready') {
  //         const cotracts = state.getIn(['contracts','data']);
  //         if(cotracts.hasCategory())
  //         const categories = cotracts.getCategories();

  //     } else {
  //         state = setError('ERROR_CONTRACTS_NOT_LOADED');
  //     }


  // }
}
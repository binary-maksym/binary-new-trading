/**
 * Class for parsing Websocket response for "contracts_for" request
 *
 * @class ContractsParser
 * @constructor
 * @example
 *      let parsed_data = new ContractsParser(response.contracts_for.available)
 *      let categories = parsed_data.getCategories();
 *
 */

import Order from '../config/order'
import {
  List,
  Map,
  fromJS
}
from 'immutable'
import Err from '../helpers/errors'

export default class ContractsParser {

  /**
   * @method constructor
   * @param {Array} CONTRACTS
   */
  constructor(contracts) {
    const [tree, error] = this._parse(contracts)
    Object.defineProperties(this, {
      _contracts: {
        get: () => contracts,
        set: () => {}
      },
      _tree: {
        get: () => tree,
        set: () => {}
      }
    })
    if (error) {
      Object.defineProperty(this, 'error', {
        get: () => error,
        set: () => {}
      })
    }
  }

  /**
   * @method _parse
   * @private
   * @param {List()} CONTRACTS
   * @return {Map()} TREE
   */
  _parse(c) {
    const contracts = fromJS(c)
    let tree = Map()
    if (List.isList(contracts)) {
      contracts.forEach(c => {
        tree = this._addDataToTree(tree, c)
      })
      tree.forEach((v1, k1) => {
        v1.get('start_types').forEach((v2, k2) => {
          tree = tree.setIn([k1, 'start_types', k2], this._completeDurations(v2))
        })
      })
    }
    let result = [tree]
    if (tree.isEmpty()) {
      result.push(Err._('ERROR_CONTRACTS_PARSING'))
    }
    return result
  }

  /**
   * @method _addDataToTree
   * @private
   * @param {Map()} TREE
   * @param {Map()} CONTRACT
   * @return {Map()} UPDATED_TREE
   */
  _addDataToTree(tree = Map(), c) {
    if (Map.isMap(c) && c.has('min_contract_duration') && c.has('max_contract_duration') && c.has('contract_category') && c.has('contract_category_display') && c.has('start_type')) {
      let duration = c.get('min_contract_duration').replace(/^\d+/, '')
      duration = duration ? duration : 'SPREADS'
      tree = tree.setIn([c.get('contract_category'), 'name'], c.get('contract_category_display'))

      let path = [c.get('contract_category'), 'start_types', c.get('start_type'), duration]
      tree = tree.setIn(path, Map({
        min_duration: c.get('min_contract_duration'),
        max_duration: c.get('max_contract_duration')
      }))
      if (c.get('low_barrier')) {
        tree = tree.setIn([...path, 'low_barrier'], c.get('low_barrier'))
      }
      if (c.get('high_barrier')) {
        tree = tree.setIn([...path, 'high_barrier'], c.get('high_barrier'))
      }
      if (c.get('barrier')) {
        tree = tree.setIn([...path, 'barrier'], c.get('barrier'))
      }
      if (c.get('last_digit_range')) {
        tree = tree.setIn([...path, 'last_digit_range'], c.get('last_digit_range'))
      }
      if (c.get('stop_profit')) {
        tree = tree.setIn([...path, 'stop_profit'], c.get('stop_profit'))
      }
      if (c.get('stop_loss')) {
        tree = tree.setIn([...path, 'stop_loss'], c.get('stop_loss'))
      }
      if (c.get('forward_starting_options')) {
        tree = tree.setIn([...path, 'forward_starting_options'], c.get('forward_starting_options'))
      }
    }
    return tree
  }

  /**
   * @method _completeDurations
   * @private
   * @param {Map()} DURATIONS
   * @return {Map()} UPDATED_DURATIONS
   */
  _completeDurations(durations = Map()) {
    let order = Order.durations
    let d2 = durations.map((v, k) => k).toList().sort((a, b) => order[a] - order[b])
    if (!d2.isEmpty()) {
      let min = durations.getIn([d2.get(0), 'min_duration']).replace(/^\d+/, '')
      let max = durations.getIn([d2.get(-1), 'max_duration']).replace(/^\d+/, '')
      if (min && max) {
        let k
        for (let d of Object.keys(order).sort((a, b) => order[a] - order[b])) {
          if (order[d] > order[max]) {
            break
          }
          if (order[d] < order[min]) {
            continue
          }

          if (!durations.has(d)) {
            durations = durations.set(d, k.set('min_duration', 1 + d))
          } else {
            k = durations.get(d)
          }
        }
      }
    }
    return durations
  }

  /**
   * Returns categories List. List order is taken from /config/order.json
   *
   * @method getCategories
   * @return {List()}
      [
          Map {
              "category": "callput",
              "name": "Up/Down"
          }, ... ,
          Map {
              "category": "spreads",
              "name": "Spreads"
          }
      ]
   */
  getCategories() {
    let categories = this._tree.map((v, k) =>
      Map({
        category: k,
        name: this._tree.getIn([k, 'name'])
      })
    ).toList().sort((a, b) => Order.categories[a.get('category')] - Order.categories[b.get('category')])
    return categories
  }

  /**
   * Returns true if there is such category
   *
   * @method hasCategory
   * @param {String} CATEGORY
   * @return {Bool}
   */
  hasCategory(category) {
    return this._tree.has(category) ? 1 : 0
  }

  /**
   * Returns durations List. List order is taken from /config/order.json
   *
   * @method getDurations
   * @param {String} CATEGORY
   * @param {String} START_TYPE, default "spot"
   * @return {List()}
     [
         Map {
             "min_duration": "5t",
             "max_duration": "10t",
             "value": "t"
         }, ... ,
         Map {
             "min_duration": "1d",
             "max_duration": "365d",
             "barrier": "+1462.51",
             "value": "d"
         }
     ]
   */
  getDurations(category, start_type = 'spot') {
    let order = Order.durations
    let durations = this._tree.getIn([category, 'start_types', start_type])
    let durations_list = List()
    if (durations) {
      durations_list = durations.map((v, k) => v.set('value', k)).toList().sort((a, b) => order[a.get('value')] - order[b.get('value')])
    }
    return durations_list
  }

  /**
   * Returns true if duration exists
   *
   * @method hasDuration
   * @param {String} CATEGORY
   * @param {String} START_TYPE default 'spot'
   * @param {String} DURATION
   * @return {Bool}
   */
  hasDuration(category, start_type = 'spot', duration) {
    return this._tree.getIn([category, 'start_types', start_type, duration]) ? 1 : 0
  }

  /**
   * Returns true if category is digit's category
   *
   * @method hasDuration
   * @param {String} CATEGORY
   * @return {Bool}
   */
  hasDigits(category) {
    return this._tree.getIn([category, 'start_types', 'spot', 't', 'last_digit_range']) ? 1 : 0
  }


  /**
   * Returns expiryType List.
   *
   * @method getExpiryTypes
   * @param {String} CATEGORY
   * @param {String} START_TYPE, default "spot"
   * @return {List()}
     [ "duration", "end_date"]
   */
  getExpiryTypes(category, start_type = 'spot') {
    let durations = this.getDurations(category, start_type)

    let types = List()
    if (!durations.isEmpty()) {
      types = types.push('duration')
      if (durations.get(-1).get('value') === 'd') {
        types = types.push('end_date')
      }
    }

    return types
  }


  /**
   * Returns barriers List() for category => start_type => duration
   *
   * @method getBarriers
   * @param {String} CATEGORY
   * @param {String} START_TYPE
   * @param {String} DURATION
   * @return {List()}
   */

  getBarriers(category, start_type = 'spot', duration) {
    const duration_info = this._tree.getIn([category, 'start_types', start_type, duration])
    let barriers = List()
    if (duration_info) {
      if (duration_info.has('barrier')) {
        barriers = barriers.push(duration_info.get('barrier'))
      } else if (duration_info.has('low_barrier')) {
        barriers = barriers.push(duration_info.get('low_barrier'))
      }

      if (duration_info.has('high_barrier')) {
        barriers = barriers.push(duration_info.get('high_barrier'))
      }
    }

    return barriers
  }

  /**
   * Returns getStartTypes Map hash.
   *
   * @method getStartTypes
   * @param {String} CATEGORY
   * @return {Map()}
     { "spot": 1, "forward": 1 }
   */
  getStartTypes(category) {
    let start_types = this._tree.getIn([category, 'start_types'])
    if (start_types) {
      return start_types.map(() => 1)
    } else {
      return Map()
    }
  }

  /**
   * Returns true if there is the catagory has such start type
   *
   * @method hasStartType
   * @param {String} CATEGORY
   * @param {String} START_TYPE
   * @return {Bool}
   */
  hasStartType(category, start_type) {
    return this._tree.hasIn([category, 'start_types', start_type]) ? 1 : 0
  }
}
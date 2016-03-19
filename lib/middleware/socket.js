/**
 * Middleware checks for ***[WS_API]*** action's object property. 
 *
 * If ***[WS_API]*** field exists middleware sends websocket request with data from [WS_API] object.
 *
 * ***[WS_API]*** object should have property "types" - the array of 3 ACTION TYPES - for pending request, success and fail.
 *
 * ***[WS_API]*** can have "stream" property - then request will be initiated as a stream.
 * 
 * @class SocketMiddleware
 * @constructor
 * @example
 *        [WS_API]: {
 *            types: ['PENDING_SYMBOLS', 'SUCCESS_SYMBOLS', 'FAILURE_SYMBOLS'], // types
 *            active_symbols: "brief" // ws request parameter
 *        }
 */
import moment from 'moment'
import Socket from '../helpers/socket'

const socket = new Socket()
export const WS_API = Symbol('WS API')

const SocketMiddleware = (next) => (action) => {
  if (action) {
    const api_request = action[WS_API]

    if (typeof api_request !== 'object' || typeof api_request.types !== 'object' || api_request.types.length !== 3) {
      return next(action)
    } else {
      const finalAction = (data) => {
        let final_action = Object.assign({}, action, data)
        delete final_action[WS_API]
        return final_action
      }
      const [pendingType, successType, failureType] = api_request.types
      const is_stream = api_request.is_stream

      let final_request = Object.assign({}, api_request)
      delete final_request.is_stream
      delete final_request.types

      let promise = socket[is_stream ? 'stream' : 'request'](final_request).then(
        result => next(finalAction({
          time: moment().unix(),
          type: successType,
          data: result
        })),
        error => next(finalAction({
          type: failureType,
          error: error
        }))
      )

      next(finalAction({
        type: pendingType
      }))

      return promise
    }
  }
}

export default SocketMiddleware
/**
 * Class for providing permanent websocket connection
 *
 * @class Socket
 * @constructor
 * @example
 *       
 *       const socket = new Socket({
 *          url: 'wss://ws.binaryws.com/websockets/v3',
 *          check_timeout: 30, // Send ping request every 30 seconds
 *          response_timeout: 10 // Consider request be failed if no response for 10 seconds
 *       });
 *
 *       socket.request({
 *           "active_symbols": "brief"
 *       }).then((active_symbols) => {
 *           processActive(active_symbols)
 *       }).catch((error) => {
 *           processError(error);
 *       });
 *       
 *       socket.stream({
 *           "ticks": "R_50"
 *       }).then((tick) => {
 *           processTick(active_symbols)
 *       }).catch((error) => {
 *           processError(error);
 *       });
 *         
 *       socket.close();
 */

import shortid from 'shortid'
export const WS_API = Symbol('WS API')

export default class Socket {

  /**
   * @method constructor
   * @param {Object} params {
   *      check_timeout: {Number},
   *      response_timeout: {Number},
   *      url: {String}
   * }      
   */
  constructor(p = {}) {
    this._requests = {}
    this._streams = {}

    this._params.check_timeout = p.check_timeout ? p.check_timeout : 30
    this._params.response_timeout = p.response_timeout ? p.response_timeout : 10 // in seconds
    this._params.url = p.url ? p.url : 'wss://ws.binaryws.com/websockets/v3'

    this._connect()
  }

  /**
   * Create WS connection and provides connection Promise    
   * @method _connect 
   * @private
   */
  _connect() {
    const ws = new WebSocket(this._params.url)

    this._connection = new Promise((resolve) => {
      ws.onopen = function() {
        startTimer()
        resolve(ws)
      }
    })

    let recon_timer
    let check_timer
    let startTimer = () => check_timer = setTimeout(() => {
      recon_timer = setTimeout(() => this._connection.then((ws) => ws.close()), this._params.response_timeout * 1000)
      this.request({
        ping: 1
      }).then(() => {
        clearTimeout(recon_timer)
        startTimer()
      })
    }, this._params.check_timeout * 1000)

    ws.onmessage = (msg) => this._processMessage(msg)

    ws.onclose = () => {
      clearTimeout(recon_timer)
      clearTimeout(check_timer)
      if (!this._closed) {
        this._reconnect()
      }
    }
  }

  /**
   * @method _reconnect 
   * @private
   */
  _reconnect() {

    this._connect()

    const old_streams = Object.assign({}, this._streams)
    this._streams = {}
    for (let k of Object.keys(old_streams)) {
      this.stream(old_streams[k].request).then(old_streams[k].resolve).catch(old_streams[k].reject)
    }
  }

  /**
   * Returns connection promise   
   * @method _getConnection 
   * @private
   */
  _getConnection() {
    return this._connection
  }

  /**
   * Makes ws request and retruns answer in then() method and error in catch() method 
   * @method request
   * @param {Object} REQUEST
   * @example
   *       socket.request({
   *           "active_symbols": "brief"
   *       }).then((active_symbols) => {
   *           processActive(active_symbols)
   *       }).catch((error) => {
   *           processError(error);
   *       });
   */
  request(req) {
    if (typeof req === 'object') {
      const request = Object.assign({
        passthrough: {
          r_id: shortid.generate()
        }
      }, req)
      this._getConnection().then((ws) => {
        ws.send(JSON.stringify(request))
      })
      return new Promise((resolve, reject) => this._requests[request.passthrough.r_id] = {
        resolve,
        reject,
        timeout: setTimeout(() => {
          Promise.reject('Request timeout')
        }, this._params.response_timeout * 1000)
      })
    } else {
      return Promise.reject('Not JSON')
    }
  }

  /**
   * Makes ws request for stream and retruns answer in then() method and error in catch() method 
   * @method stream
   * @param {Object} REQUEST
   * @example
   *       socket.stream({
   *           "ticks": "R_50"
   *       }).then((tick) => {
   *           processTick(active_symbols)
   *       }).catch((error) => {
   *           processError(error);
   *       });
   */
  stream(req) {

    if (typeof req === 'object') {
      const r_id = shortid.generate()
      const request = Object.assign({
        passthrough: {
          r_id: r_id
        }
      }, req)
      this._getConnection().then((ws) => {
        ws.send(JSON.stringify(request))
      })

      const setTimer = (err_cb) => {
        clearTimeout(this._streams[r_id])
        this._streams[r_id] = {
          request: req,
          timeout: setTimeout(() => {
            err_cb('Request timeout')
          }, this._params.response_timeout * 1000)
        }
      }

      return {
        then: (cb = () => {}, err_cb = () => {}) => {
          this._streams[r_id].resolve = cb
          this._streams[r_id].reject = err_cb
          setTimer(err_cb)
          return {
            catch: (cb) => {
              if (typeof cb === 'function') {
                this._streams[r_id].reject = cb
                setTimer(cb)
              }
            }
          }
        },
        catch: (cb) => {
          this._streams[r_id].reject = cb
          setTimer(cb)
          return {
            then: (cb = () => {}, err_cb) => {
              this._streams[r_id].resolve = cb
              if (typeof err_cb === 'function') {
                this._streams[r_id].reject = err_cb
              }
              setTimer(err_cb)
            }
          }
        }
      }
    } else {
      return {
        then: () => {
          return {
            catch: (cb) => {
              if (typeof cb === 'function') {
                cb('Not JSON')
              }
            }
          }
        }
      }
    }
  }

  /**
   * Processes WS response message   
   * @method _processMessage 
   * @private
   */
  _processMessage(msg) {
    const response = JSON.parse(msg.data)
    if (typeof response.echo_req !== 'undefined' && typeof response.echo_req.passthrough !== 'undefined' && response.echo_req.passthrough.r_id) {

      const r_id = response.echo_req.passthrough.r_id
      if (this._requests[r_id]) {
        clearTimeout(this._requests[r_id].timeout)
        if (response.msg_type && response[response.msg_type]) {
          this._requests[r_id]['resolve'](response[response.msg_type])
        } else {
          this._requests[r_id]['reject'](response['error'])
        }
        delete this._requests[response.req_id]
      } else if (this._streams[r_id]) {
        clearTimeout(this._streams[r_id].timeout)
        if (response.msg_type && response[response.msg_type]) {
          this._streams[r_id].id = response[response.msg_type].id
          this._streams[r_id]['resolve'](response[response.msg_type])
        } else {
          this._streams[r_id]['reject'](response['error'])
          delete this._streams[r_id]
        }
      }
    }
  }

  /**
   * Closes connection  
   * @method close 
   */
  close() {
    this._closed = 1
    this._getConnection().then((ws) => ws.close())
  }
}
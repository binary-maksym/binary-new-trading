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

import shortid from 'shortid';
export const WS_API = Symbol('WS API')

export default function Socket(input_params = {}) {

    let _requests = {},
        _streams = {};

    let _params = {};
    let _connection;
    let _closed = 0;

    /**
     * @method constructor
     * @param {Object} params {
     *      check_timeout: {Number},
     *      response_timeout: {Number},
     *      url: {String}
     * }      
     */
    function constructor(p = {}) {
        _params.check_timeout = p.check_timeout ? p.check_timeout : 30;
        _params.response_timeout = p.response_timeout ? p.response_timeout : 10; // in seconds
        _params.url = p.url ? p.url : 'wss://ws.binaryws.com/websockets/v3';

        _connect();
    }

    /**
     * Create WS connection and provides connection Promise    
     * @method _connect 
     * @private
     */
    function _connect() {
        const ws = new WebSocket(_params.url);

        _connection = new Promise((resolve, reject) => {
            ws.onopen = function() {
                startTimer();
                resolve(ws);
            }
        });

        let recon_timer, check_timer, startTimer = () => check_timer = setTimeout(() => {
            recon_timer = setTimeout(() => _connection.then((ws) => ws.close()), _params.response_timeout * 1000)
            request({
                ping: 1
            }).then(() => {
                clearTimeout(recon_timer);
                startTimer();
            })
        }, _params.check_timeout * 1000);

        ws.onmessage = (msg) => _processMessage(msg);

        ws.onclose = () => {
            clearTimeout(recon_timer);
            clearTimeout(check_timer);
            if (!_closed) {
                _reconnect()
            }
        };
    }

    /**
     * @method _reconnect 
     * @private
     */
    function _reconnect() {

        _connect();

        const old_streams = Object.assign({}, _streams);
        _streams = {};
        for (let k of Object.keys(old_streams)) {
            stream(old_streams[k].request).then(old_streams[k].resolve).catch(old_streams[k].reject);
        }
    }

    /**
     * Returns connection promise   
     * @method _getConnection 
     * @private
     */
    function _getConnection() {
        return _connection;
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
    function request(req) {
        if (typeof req === 'object') {
            const request = Object.assign({
                passthrough: {
                    r_id: shortid.generate()
                }
            }, req);
            _getConnection().then((ws) => {
                ws.send(JSON.stringify(request));
            });
            return new Promise((resolve, reject) => _requests[request.passthrough.r_id] = {
                resolve,
                reject,
                timeout: setTimeout(() => {
                    Promise.reject('Request timeout')
                }, _params.response_timeout * 1000)
            });
        } else {
            return Promise.reject('Not JSON');
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
    function stream(req) {

        if (typeof req === 'object') {
            const r_id = shortid.generate();
            const request = Object.assign({
                passthrough: {
                    r_id: r_id
                }
            }, req);
            _getConnection().then((ws) => {
                ws.send(JSON.stringify(request));
            });

            const setTimer = (err_cb) => {
                clearTimeout(_streams[r_id]);
                _streams[r_id] = {
                    request: req,
                    timeout: setTimeout(() => {
                        err_cb('Request timeout')
                    }, _params.response_timeout * 1000)
                }
            };

            return {
                then: (cb = () => {}, err_cb = () => {}) => {
                    _streams[r_id].resolve = cb;
                    _streams[r_id].reject = err_cb;
                    setTimer(err_cb);
                    return {
                        catch: (cb) => {
                            if (typeof cb === 'function') {
                                _streams[r_id].reject = cb;
                                setTimer(cb);
                            }
                        }
                    }
                },
                catch: (cb) => {
                    _streams[r_id].reject = cb;
                    setTimer(cb);
                    return {
                        then: (cb = () => {}, err_cb) => {
                            _streams[r_id].resolve = cb;
                            if (typeof err_cb === 'function') {
                                _streams[r_id].reject = err_cb;
                            }
                            setTimer(err_cb);
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
    function _processMessage(msg) {
        const response = JSON.parse(msg.data);
        if (typeof response.echo_req !== 'undefined' && typeof response.echo_req.passthrough !== 'undefined' && response.echo_req.passthrough.r_id) {

            const r_id = response.echo_req.passthrough.r_id;
            if (_requests[r_id]) {
                clearTimeout(_requests[r_id].timeout);
                if (response.msg_type && response[response.msg_type]) {
                    _requests[r_id]['resolve'](response[response.msg_type]);
                } else {
                    _requests[r_id]['reject'](response['error']);
                }
                delete _requests[response.req_id];
            } else if (_streams[r_id]) {
                clearTimeout(_streams[r_id].timeout);
                if (response.msg_type && response[response.msg_type]) {
                    _streams[r_id].id = response[response.msg_type].id;
                    _streams[r_id]['resolve'](response[response.msg_type]);
                } else {
                    _streams[r_id]['reject'](response['error']);
                    delete _streams[r_id];
                }
            }
        }
    }

    /**
     * Closes connection  
     * @method close 
     */
    function close() {
        _closed = 1;
        _getConnection().then((ws) => ws.close());
    }

    constructor(input_params);

    return {
        request,
        stream,
        close
    }
}
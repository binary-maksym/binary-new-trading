/**
 * Middleware checks if state.error has new error after action dispatched. 
 *
 * If it has - returns Promise.reject(action). If no new errors were added - returns Promise.resolve(action) 
 *
 * @class PromiseMiddleware
 * @constructor
 */

import Immutable from 'immutable';

const PromiseMiddleware = store => next => action => {
    let error1 = store.getState().get('error');
    let result = next(action);
    let error2 = store.getState().get('error');

    if (!error1) {
        error1 = Immutable.Map();
    }

    if (!error2) {
        error2 = Immutable.Map();
    }

    let has_new_error;
    error2.forEach((v, k) => {
        if (!error1.has(k) || !Immutable.is(error2.get(k), error1.get(k))) {
            has_new_error = 1;
            return;
        }
    });

    if (has_new_error) {
        return Promise.reject(result);
    } else {
        return Promise.resolve(result);
    }

}
export default PromiseMiddleware;

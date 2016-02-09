import {
    Map
}
from 'immutable';

const PromiseMiddleware = store => next => action => {
    let error1 = store.getState().get('error');
    let result = next(action);
    let error2 = store.getState().get('error');

    if (!error1) {
        error1 = Map();
    }

    if (!error2) {
        error2 = Map();
    }

    if (error1.equals(error2)) {
        return Promise.resolve(result);
    } else {
        return Promise.reject(result);
    }

}
export default PromiseMiddleware;

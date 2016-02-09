/**
 * Middleware checks "storage" property in store object and saves values from it to localStorage each time action dispatched
 *
 * @class SaveToStorageMiddleware
 * @constructor
 *
 */

const SaveToStorageMiddleware = store => next => action => {

    let result = next(action);
    let storage = store.getState().getIn(['trading_form', 'storage']);
    if (storage) {
        storage.forEach((v, k) => {
            localStorage.setItem(k, v);
        });
    }
    return result;
};

export default SaveToStorageMiddleware;

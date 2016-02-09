import {
    Map, Iterable, fromJS
}
from 'immutable';

export default function ErrorReducer(state = Map(), action = {}) {

    // if (action.type === 'CLEAR_ERROR') {
    //     return Map();
    // } else if (/FAILURE|ERROR/.test(action.type) && typeof action.error === 'object' && action.error.code && action.error.message) {
    //     return state.set('code', action.error.code).set('message', action.error.message)
    // } else {
    //     return state;
    // }

    return state;
}

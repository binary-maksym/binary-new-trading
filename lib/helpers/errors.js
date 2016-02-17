import Immutable from 'immutable';
import ERRORS from '../config/errors';

export default class Err {

    _(error) {
        return typeof ERRORS[error] === 'object' ? Immutable.fromJS({ code: error, msg: ERRORS[error] }) : Immutable.fromJS({
            code: 'error',
            message: 'Error'
        });
    }

    process(error){
    	return;
    }
}
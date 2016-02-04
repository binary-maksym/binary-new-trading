import Socket from '../utils/socket';

const socket = new Socket();
export const WS_API = Symbol('WS API');

export default store => next => action => {

    const api_request = action[WS_API];

    if (typeof api_request !== 'object' || typeof api_request.types !== 'object' || api_request.types.length !== 3) {
        return next(action);
    } else {
        const finalAction = (data) => {
            let final_action = Object.assign({}, action, data);
            delete final_action[WS_API];
            return final_action;
        }
        const [pendingType, successType, failureType] = api_request.types;
        const is_stream = api_request.is_stream;

        let final_request = Object.assign({}, api_request);
        delete final_request.is_stream;
        delete final_request.types;
        next(finalAction({
            type: pendingType
        }));

        return socket[is_stream ? 'stream' : 'request'](final_request).then((result) => {
            next(finalAction({
                type: successType,
                data: result
            }));
        }).catch((error) => {
            next(finalAction({
                type: failureType,
                error: error
            }));
        });
    }

}

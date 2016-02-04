import Socket from '../utils/socket';

let socket = new Socket();

export default store => next => action => {
    // let a = socket.request(action[WS_API]);

    // a.then((b) => console.log(b))

    // setTimeout(()=>{
    //     a.then((b) => console.log(b))
    // },10000)

    // setTimeout(()=>{
    //     console.log(a);
    // }, 5000);
    // socket.send();
    return next(action);
}

const Queue = (store) => {

    let queue = [];

    const add = (cb) => {
        if (typeof cb === 'function') {
            queue.push(cb);
        }
    };

    const next = () => {
        let cb = queue.shift();
        if(cb){
            cb();
        }
    }

    const size = () => queue.length;

    return {
        add,
        next,
        revert,
        size
    };
}

export default Queue;

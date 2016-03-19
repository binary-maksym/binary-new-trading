import market from './market';

export default class Props {

    static getProps() {
        return {
            market
        }
    }

    static setProp(state, prop, value) {
        const props = Props.getProps();

        if (props[prop]) {
            const clearProps = (_props) => {
                for (let prop of _props) {
                    state = props[prop] ? state.delete(props[prop].id()) : state;
                    if (props[prop].nexts()) {
                        state = clearProp(props[prop].nexts());
                    }
                }
                return state;
            }

            state = clearProps(props[prop].nexts());
            state = state.set(props[prop].id(), value);
        }

        return state;
    }

    static setError(state, error) {
        return state.set('error', error)
    }
}

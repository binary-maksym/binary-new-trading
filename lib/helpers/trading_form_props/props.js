export default class Props {

  static getId() {}
  static getActionName() {}
  static nextProps() {}
  static nextProp() {}
  static getAction() {}
  static getDefault() {}
  static setValue() {}

  static setProp(state, prop, value) {

    state = Props._clearProps(state, prop.nextProps())
    state = state.set(prop.getId(), value)

    return state
  }

  static _clearProps(state, props) {
    for (let prop of props) {
      state = state.delete(prop.getId())
      if (prop.nextProps().length) {
        state = Props._clearProp(prop.nextProps())
      }
    }
    return state
  }

  static setError(state, error) {
    return state.set('error', error)
  }
}
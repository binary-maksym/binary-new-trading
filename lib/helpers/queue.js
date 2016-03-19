const Queue = () => {

  let queue = []
  let action_is_running = 0

  const add = (cb) => {
    if (typeof cb === 'function') {
      queue.push(cb)
    }
  }

  const next = () => {
    return {
      start: () => {
        let cb = queue.shift()
        if (!action_is_running && typeof cb === 'function') {
          action_is_running = 1
          cb()
        }
      },
      finish: () => {
        action_is_running = 0
      }
    }
  }

  const size = () => queue.length
  const revert = () => {}

  return {
    add,
    next,
    revert,
    size
  }
}

export default Queue
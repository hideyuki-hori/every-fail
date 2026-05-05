process.removeAllListeners('warning')
process.on('warning', warning => {
  if (
    warning.name === 'ExperimentalWarning' &&
    /SQLite/.test(warning.message)
  ) {
    return
  }
  console.warn(warning.stack ?? `${warning.name}: ${warning.message}`)
})

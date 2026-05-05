import { closeDb, getDb } from './db.ts'

const usage = () => {
  console.log('Usage: pnpm ef <command> [...args]')
  console.log('')
  console.log('Commands:')
  console.log('  config — 設定操作 (get / set / unset / list)')
  console.log('  dot — dot 操作 (new / dev / build / deploy)')
  console.log('  dots — dots 操作 (build / deploy / migrate)')
  console.log('  deploy — every.fail 自体の deploy')
}

const handleConfig = (args: string[]) => {
  console.log('TODO: ef config', args)
}

const handleDot = (args: string[]) => {
  console.log('TODO: ef dot', args)
}

const handleDots = (args: string[]) => {
  console.log('TODO: ef dots', args)
}

const handleDeploy = () => {
  console.log('TODO: ef deploy')
}

const main = () => {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    usage()
    process.exit(0)
  }
  getDb()
  const [command, ...rest] = args
  switch (command) {
    case 'config':
      handleConfig(rest)
      break
    case 'dot':
      handleDot(rest)
      break
    case 'dots':
      handleDots(rest)
      break
    case 'deploy':
      handleDeploy()
      break
    default:
      console.error(`Unknown command: ${command}`)
      usage()
      closeDb()
      process.exit(1)
  }
  closeDb()
}

main()

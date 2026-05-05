import { handleConfig } from './config.ts'
import { closeDb, getDb } from './db.ts'
import { isTty, select } from './menu.ts'
import { migrate } from './migrations.ts'

const usage = () => {
  console.log('Usage: pnpm ef <command> [...args]')
  console.log('')
  console.log('Commands:')
  console.log('  config — 設定操作 (get / set / unset / list)')
  console.log('  dot — dot 操作 (new / dev / build / deploy)')
  console.log('  dots — dots 操作 (build / deploy / migrate)')
  console.log('  deploy — every.fail 自体の deploy')
}

const usageDot = () => {
  console.log('Usage: pnpm ef dot <action> [...args]')
  console.log('')
  console.log('Actions:')
  console.log('  new — dot 新規作成')
  console.log('  dev — 開発サーバー起動')
  console.log('  build — ビルド')
  console.log('  deploy — デプロイ')
}

const usageDots = () => {
  console.log('Usage: pnpm ef dots <action>')
  console.log('')
  console.log('Actions:')
  console.log('  build — 全 dot をビルド')
  console.log('  deploy — 全 dot をデプロイ')
  console.log('  migrate — マイグレーション実行')
}

const pickTopCommand = () =>
  select('ef', [
    { hotkey: '1', label: 'config — 設定操作', value: 'config' },
    { hotkey: '2', label: 'dot — dot 操作', value: 'dot' },
    { hotkey: '3', label: 'dots — dots 操作', value: 'dots' },
    {
      hotkey: '4',
      label: 'deploy — every.fail 自体の deploy',
      value: 'deploy',
    },
  ])

const pickDotAction = () =>
  select('ef dot', [
    { hotkey: '1', label: 'new — dot 新規作成', value: 'new' },
    { hotkey: '2', label: 'dev — 開発サーバー起動', value: 'dev' },
    { hotkey: '3', label: 'build — ビルド', value: 'build' },
    { hotkey: '4', label: 'deploy — デプロイ', value: 'deploy' },
  ])

const pickDotsAction = () =>
  select('ef dots', [
    { hotkey: '1', label: 'build — 全 dot をビルド', value: 'build' },
    { hotkey: '2', label: 'deploy — 全 dot をデプロイ', value: 'deploy' },
    { hotkey: '3', label: 'migrate — マイグレーション実行', value: 'migrate' },
  ])

const handleDot = async (args: string[]) => {
  if (args.length === 0) {
    if (!isTty()) {
      usageDot()
      process.exit(1)
    }
    const action = await pickDotAction()
    console.log(`TODO: ef dot ${action}`)
    return
  }
  console.log('TODO: ef dot', args)
}

const handleDots = async (args: string[]) => {
  if (args.length === 0) {
    if (!isTty()) {
      usageDots()
      process.exit(1)
    }
    const action = await pickDotsAction()
    console.log(`TODO: ef dots ${action}`)
    return
  }
  console.log('TODO: ef dots', args)
}

const handleDeploy = () => {
  console.log('TODO: ef deploy')
}

const main = async () => {
  let args = process.argv.slice(2)
  if (args.length === 0) {
    if (!isTty()) {
      usage()
      process.exit(1)
    }
    const cmd = await pickTopCommand()
    args = [cmd]
  }
  const db = getDb()
  migrate(db)
  const [command, ...rest] = args
  try {
    switch (command) {
      case 'config':
        handleConfig(db, rest)
        break
      case 'dot':
        await handleDot(rest)
        break
      case 'dots':
        await handleDots(rest)
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
  } finally {
    closeDb()
  }
}

main()

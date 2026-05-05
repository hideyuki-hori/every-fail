import './suppress-warnings.ts'
import type { DatabaseSync } from 'node:sqlite'
import { parseArgs } from 'node:util'
import { handleConfig } from './config.ts'
import { closeDb, getDb } from './db.ts'
import { dotAdd } from './dot-add.ts'
import { dotBuild } from './dot-build.ts'
import { dotDeploy } from './dot-deploy.ts'
import { dotDeployAll } from './dot-deploy-all.ts'
import { dotRm } from './dot-rm.ts'
import { isTty, select } from './menu.ts'
import { migrate } from './migrations.ts'

function usage(): void {
  console.log('Usage: pnpm ef <command> [...args]')
  console.log('')
  console.log('Commands:')
  console.log('  config — 設定操作 (get / set / unset / list)')
  console.log('  dot — dot 操作 (add / rm / dev / build / deploy)')
  console.log('  build — 基盤 (web / /dots 一覧 / sitemap) を build')
  console.log('  deploy — 基盤を Cloudflare に deploy')
}

function usageDot(): void {
  console.log('Usage: pnpm ef dot <action> [...args]')
  console.log('')
  console.log('Actions:')
  console.log('  add — dot 新規作成')
  console.log('  rm — dot 削除 (フォルダ + dots テーブル)')
  console.log('  dev — 開発サーバー起動')
  console.log('  build — ビルド')
  console.log('  deploy — デプロイ')
}

function pickTopCommand(): Promise<string> {
  return select('ef', [
    { hotkey: '1', label: 'config — 設定操作', value: 'config' },
    { hotkey: '2', label: 'dot — dot 操作', value: 'dot' },
    { hotkey: '3', label: 'build — 基盤を build', value: 'build' },
    { hotkey: '4', label: 'deploy — 基盤を deploy', value: 'deploy' },
  ])
}

function pickDotAction(): Promise<string> {
  return select('ef dot', [
    { hotkey: '1', label: 'add — dot 新規作成', value: 'add' },
    { hotkey: '2', label: 'rm — dot 削除', value: 'rm' },
    { hotkey: '3', label: 'dev — 開発サーバー起動', value: 'dev' },
    { hotkey: '4', label: 'build — ビルド', value: 'build' },
    { hotkey: '5', label: 'deploy — デプロイ', value: 'deploy' },
  ])
}

async function handleDot(db: DatabaseSync, args: string[]): Promise<void> {
  if (args.length === 0) {
    if (!isTty()) {
      usageDot()
      process.exit(1)
    }
    const action = await pickDotAction()
    if (action === 'add' || action === 'rm') {
      console.error(
        `対話メニューからの ${action} は未対応。pnpm ef dot ${action} <arg> で実行してください`
      )
      process.exit(1)
    }
    if (action === 'build') {
      await dotBuild(db)
      return
    }
    if (action === 'deploy') {
      await dotDeploy(db, [])
      return
    }
    console.log(`TODO: ef dot ${action}`)
    return
  }
  const [action, ...rest] = args
  if (action === 'add') {
    const { positionals } = parseArgs({ args: rest, allowPositionals: true })
    dotAdd(db, positionals)
    return
  }
  if (action === 'rm') {
    const { positionals } = parseArgs({ args: rest, allowPositionals: true })
    dotRm(db, positionals)
    return
  }
  if (action === 'build') {
    await dotBuild(db)
    return
  }
  if (action === 'deploy') {
    if (rest.includes('--all')) {
      await dotDeployAll(db, rest)
      return
    }
    await dotDeploy(db, rest)
    return
  }
  console.log('TODO: ef dot', args)
}

function handleBuild(): void {
  console.log('TODO: ef build')
}

function handleDeploy(): void {
  console.log('TODO: ef deploy')
}

async function main(): Promise<void> {
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
        await handleDot(db, rest)
        break
      case 'build':
        handleBuild()
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

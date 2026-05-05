const usage = () => {
  console.log('Usage: pnpm ef -- <command> [...args]')
  console.log('')
  console.log('Commands:')
  console.log('  config — 設定操作 (get / set / unset / list)')
  console.log('  dot — dot 操作 (new / dev / build / deploy)')
  console.log('  dots — dots 操作 (build / deploy / migrate)')
  console.log('  deploy — every.fail 自体の deploy')
}

const main = () => {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    usage()
    process.exit(0)
  }
  console.log('TODO: handle', args)
}

main()

import { emitKeypressEvents } from 'node:readline'

export type MenuItem = {
  hotkey: string
  label: string
  value: string
}

type KeyEvent = {
  name?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  sequence?: string
}

export function isTty(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}

export function select(title: string, items: MenuItem[]): Promise<string> {
  return new Promise(resolve => {
    let cursor = 0
    const stdin = process.stdin
    const stdout = process.stdout

    function draw(rewrite: boolean): void {
      if (rewrite) stdout.write(`\x1b[${items.length + 2}A`)
      stdout.write(`\x1b[2K${title}\n`)
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        const marker = i === cursor ? '>' : ' '
        stdout.write(`\x1b[2K${marker} [${it.hotkey}] ${it.label}\n`)
      }
      stdout.write('\x1b[2K[jk で選択, Enter で決定, Esc/Ctrl-C で中止]\n')
    }

    function cleanup(): void {
      stdin.off('keypress', onKey)
      if (stdin.isTTY) stdin.setRawMode(false)
      stdin.pause()
      stdout.write(`\x1b[${items.length + 2}A\x1b[0J`)
    }

    function onKey(str: string | undefined, key: KeyEvent): void {
      if (key.ctrl && key.name === 'c') {
        cleanup()
        process.exit(130)
      }
      if (key.name === 'escape') {
        cleanup()
        process.exit(130)
      }
      if (str === 'k') {
        cursor = (cursor - 1 + items.length) % items.length
        draw(true)
        return
      }
      if (str === 'j') {
        cursor = (cursor + 1) % items.length
        draw(true)
        return
      }
      if (key.name === 'return') {
        cleanup()
        resolve(items[cursor].value)
        return
      }
      if (str) {
        const item = items.find(it => it.hotkey === str)
        if (item) {
          cleanup()
          resolve(item.value)
        }
      }
    }

    emitKeypressEvents(stdin)
    if (stdin.isTTY) stdin.setRawMode(true)
    stdin.resume()
    draw(false)
    stdin.on('keypress', onKey)
  })
}

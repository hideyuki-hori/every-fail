import type { Unmount } from '@every-fail/dot-sdk'
import './styles/index.css'
import { getDotById } from './dots'
import { onRoute } from './router'

const main = document.querySelector<HTMLElement>('main.content')
if (main) {
  let unmount: Unmount | null = null
  onRoute(pathname => {
    if (unmount) {
      unmount()
      unmount = null
    }
    main.replaceChildren()
    const match = pathname.match(/^\/dots\/(.+)$/)
    if (match) {
      const id = match[1]
      const dot = getDotById(id)
      if (dot) {
        unmount = dot.mount({ root: main })
      } else {
        main.textContent = '404'
      }
    } else if (pathname === '/') {
      main.textContent = 'every.fail'
    } else {
      main.textContent = '404'
    }
  })
}

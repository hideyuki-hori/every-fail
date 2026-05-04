import './styles/index.css'
import { onRoute } from './router'

const main = document.querySelector<HTMLElement>('main.content')
if (main) {
  onRoute(pathname => {
    main.textContent = pathname
  })
}

import { Effect } from 'effect'
import './styles/index.css'

Effect.runSync(Effect.sync(() => console.log(1)))

fetch('http://localhost:8788/api/dots/a').then(a => a.text()).then(console.log)
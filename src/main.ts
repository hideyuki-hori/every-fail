import { Effect } from 'effect'
import './styles/index.css'

Effect.runSync(Effect.sync(() => console.log(1)))
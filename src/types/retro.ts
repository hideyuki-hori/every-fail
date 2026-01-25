import type { Content } from './content'
import type { Period } from './period'

// titleはSprint X 振り返りのように生成するので不要
export interface Retro extends Content<'retro'> {
  sprint: number
  period: Period
}

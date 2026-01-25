import type { Content } from './content'

export interface Log extends Content<'log'> {
  title: string
}

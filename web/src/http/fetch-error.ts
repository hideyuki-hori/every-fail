import { Data } from 'effect'

export class FetchError extends Data.TaggedError('FetchError')<{
  readonly url: string
}> {}

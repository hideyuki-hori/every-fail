import { Data } from 'effect'

export class FetchError extends Data.TaggedError('FetchError')<{
  readonly url: string
}> {}

export class DecodeError extends Data.TaggedError('DecodeError')<{
  readonly message: string
}> {}

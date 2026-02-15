import { Chunk, Effect, Option, Stream } from 'effect'
import { Doc } from '../service/doc'
import { isInternalLink } from './is-internal'

export const clickNavigations = Stream.unwrap(
  Effect.map(Doc, doc =>
    Stream.async<MouseEvent>((emit) => {
      doc.addEventListener('click', e => {
        emit(Effect.succeed(Chunk.of(e)))
      })
    }),
  ),
).pipe(
  Stream.filterMap(e => {
    const target = (e.target instanceof Element)
      ? e.target.closest('a')
      : null
    if (
      !target
      || !(target instanceof HTMLAnchorElement)
      || !isInternalLink(target)
    ) {
      return Option.none()
    }
    if (target.pathname === location.pathname) return Option.none()

    e.preventDefault()
    history.pushState(null, '', target.pathname)
    return Option.some(target.pathname)
  }),
)

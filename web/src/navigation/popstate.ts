import { Chunk, Effect, Stream } from 'effect'

export const popstateNavigations = Stream.async<PopStateEvent>((emit) => {
  window.addEventListener('popstate', e => {
    emit(Effect.succeed(Chunk.of(e)))
  })
}).pipe(
  Stream.map(() => location.pathname),
)

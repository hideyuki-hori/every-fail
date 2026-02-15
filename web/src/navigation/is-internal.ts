export function isInternalLink(anchor: HTMLAnchorElement): boolean {
  return (
    anchor.origin === location.origin
    && !anchor.hasAttribute('download')
    && anchor.target !== '_blank'
  )
}

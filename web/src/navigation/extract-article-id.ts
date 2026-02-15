const UUID_V7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function extractArticleId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (
    segments.length === 1
    && UUID_V7_RE.test(segments[0])
  ) {
    return segments[0]
  }
  return null
}

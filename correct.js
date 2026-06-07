{
  const start = performance.now()
  const clicks = []

  document.addEventListener('click', e => {
    const el = e.target.closest('a, button')
    if (!el) return
    clicks.push({
      target: (el.textContent || '').trim().slice(0, 80) || el.tagName,
      at: Math.round(performance.now() - start),
    })
  })

  let sent = false
  const flush = () => {
    if (sent) return
    sent = true
    navigator.sendBeacon(
      '/api/correct',
      JSON.stringify({
        kind: 'pageview',
        path: location.pathname,
        referrer: document.referrer,
        duration: Math.round(performance.now() - start),
        clicks,
      })
    )
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
}

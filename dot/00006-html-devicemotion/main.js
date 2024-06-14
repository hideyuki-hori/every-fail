document.querySelector('button').addEventListener('click', () =>
  DeviceMotionEvent.requestPermission().then(permission => {
    if (permission !== 'granted') return
    document.querySelector('button').innerHTML = 'やってる'
    const kani = document.querySelector('img')
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    window.addEventListener('devicemotion', event => {
      x += event.accelerationIncludingGravity.x
      y += event.accelerationIncludingGravity.y
      kani.style.left = `${Math.ceil(x)}px`
      kani.style.top = `${Math.ceil(y)}px`
    })
  })
)

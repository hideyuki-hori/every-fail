import './style.css'
import vite from './assets/vite.svg'
import sample from './assets/sample.jpg'

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  {
    const img = document.createElement('img')
    img.src = vite
    img.alt = ''
    element.appendChild(img)
  }
  {
    const img = document.createElement('img')
    img.src = sample
    img.alt = ''
    element.appendChild(img)
  }
  element.addEventListener('click', () => setCounter(++counter))
  setCounter(0)
}

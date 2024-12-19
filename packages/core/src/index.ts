import './style.css'
import createBox from '../lib'
import logo from './logo.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://www.npmjs.com/package/@boites/core" target="_blank" class="package">
      <img src="${logo}" class="logo" alt="logo" />
      <code>@boxly/core</code>
    </a>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Logo and Package Name to learn more
    </p>
  </div>
`

const countBox = createBox(0)
  
setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

function setupCounter(element: HTMLButtonElement) {
  const setCounter = () => {
    element.innerHTML = `count is ${countBox.getData()}`
  }
  element.addEventListener('click', () => {
    countBox.setData(c => c + 1)
    setCounter()
  })
  setCounter()
}

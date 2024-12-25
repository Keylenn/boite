import "./style.css";
import createBox, {
  createStorageBox,
  createJsonBinBox,
  ProtectedBox,
} from "../lib";
import logo from "./logo.svg";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://www.npmjs.com/package/@boites/core" target="_blank" class="package">
      <img src="${logo}" class="logo" alt="logo" />
      <code>@boxly/core</code>
    </a>
    <div class="card">
      <button id="counter" type="button"></button>
      <br />
      <br />
      <button id="counter1" type="button"></button>
      <br />
      <br />
      <button id="counter2" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Logo and Package Name to learn more
    </p>
  </div>
`;

const countBox = createBox(0);

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!, {
  box: countBox,
});

const countFromStorage = createStorageBox(0, "count-from-storage");

setupCounter(document.querySelector<HTMLButtonElement>("#counter1")!, {
  box: countFromStorage,
  customHtml: (count) => `count from storage is ${count}`,
});

const countFromJsonBin = await createJsonBinBox(0, {
  binId: "676384f0acd3cb34a8bc078b",
  apiKey: "$2b$10$ev4EaGj6NEzMlS.myhbj4OcEupx7X6CuPSpGdn/PT0d4AiixCJwXy",
});

setupCounter(document.querySelector<HTMLButtonElement>("#counter2")!, {
  box: countFromJsonBin,
  customHtml: (count) => `count from jsonbin is ${count}`,
});

function setupCounter(
  element: HTMLButtonElement,
  {
    box,
    customHtml,
  }: { box: ProtectedBox; customHtml?: (count: number) => string }
) {
  const setCounter = () => {
    const count = box.getData();
    element.innerHTML = customHtml ? customHtml(count) : `count is ${count}`;
  };
  element.addEventListener("click", () => {
    box.setData((c: number) => c + 1);
    setCounter();
  });
  setCounter();
}

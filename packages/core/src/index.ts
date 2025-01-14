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
      <button id="counter2" type="button">loading...</button>
    </div>
    <p class="read-the-docs">
      Click on the Logo and Package Name to learn more
    </p>
  </div>
`;

const countBox = createBox<number | void>(0);

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!, {
  box: countBox,
});

const countBoxFromStorage = createStorageBox<null | number>(
  "count-from-storage"
);

setupCounter(document.querySelector<HTMLButtonElement>("#counter1")!, {
  box: countBoxFromStorage,
  customHtml: (count) => `count from storage is ${count || 0}`,
});

const countBoxFromJsonBin = createJsonBinBox(
  0,
  {
    binId: "676384f0acd3cb34a8bc078b",
    apiKey: "$2b$10$ev4EaGj6NEzMlS.myhbj4OcEupx7X6CuPSpGdn/PT0d4AiixCJwXy",
  },
  {
    onCreated: (box) => {
      setupCounter(document.querySelector<HTMLButtonElement>("#counter2")!, {
        box,
        customHtml: (count) => `count from jsonbin is ${count}`,
      });
    },
  }
);

console.log("boxData = ", countBoxFromJsonBin.getData());
countBoxFromJsonBin
  .getExtraStoreSnapshotAsync()
  .then((d) => console.log("getExtraStoreSnapshotAsync =", d));
setTimeout(() => {
  console.log("setTimeout_3000_boxData =", countBoxFromJsonBin.getData());
}, 3000);

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

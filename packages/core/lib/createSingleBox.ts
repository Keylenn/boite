import createBox, { CreateBoxOption } from "./index";

const BoxMap = new Map();

export default function createSingleBox<T>(
  iData: T,
  key: string,
  option?: CreateBoxOption<T>
) {
  if (!key) {
    throw new Error("Create the box requires a unique string key.");
  }
  if (BoxMap.has(key)) {
    return BoxMap.get(key) as typeof box;
  }
  const box = createBox<T>(iData, option);
  BoxMap.set(key, box);

  return box;
}

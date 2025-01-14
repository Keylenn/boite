import createBox from "./createBox";
import type { ProtectedBox, CreateBoxOption, BoxData } from "./createBox";

export default createBox;

export type { ProtectedBox, CreateBoxOption, BoxData };

export type Selector<T extends ProtectedBox, D = BoxData<T>> = (data: D) => any;

export { default as createSingleBox } from "./createSingleBox";

export { default as createStorageBox } from "./createStorageBox";
export type { StorageOptions, StorageContext } from "./createStorageBox";

export { default as createJsonBinBox, JsonBin } from "./createJsonBinBox";
export type { JsonBinOption, RequestLibrary } from "./createJsonBinBox";

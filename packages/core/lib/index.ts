import createBox from "./createBox";

export type ProtectedBox<T = any> = ReturnType<typeof createBox<T>>;
export type BoxData<T extends ProtectedBox> = ReturnType<T["getData"]>;
export type Selector<T extends ProtectedBox, D = BoxData<T>> = (data: D) => any;

export default createBox;

export { default as createSingleBox } from "./createSingleBox";

export { default as createStorageBox } from "./createStorageBox";
export type { StorageOptions, StorageContext } from "./createStorageBox";

export { default as createJsonBinBox, JsonBin } from "./createJsonBinBox";
export type { JsonBinOption, RequestLibrary } from "./createJsonBinBox";

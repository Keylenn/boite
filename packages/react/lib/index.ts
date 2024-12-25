import useSyncBoxStore from "./useSyncBoxStore";

export default useSyncBoxStore;
export { default as curryUseSyncBoxStore } from "./curryUseSyncBoxStore";
export { default as shallowEqual } from "./util/shallowEqual";

export type { ProtectedBox, BoxData, Selector } from "@boxly/core";
export type { UseSyncBoxStoreOption } from "./useSyncBoxStore";

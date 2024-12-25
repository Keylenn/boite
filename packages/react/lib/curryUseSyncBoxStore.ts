import { BoxData, ProtectedBox, Selector } from "@boxly/core";
import useSyncBoxStore, { UseSyncBoxStoreOption } from "./index";

export default function curryUseSyncBoxStore<T extends ProtectedBox>(
  box: T
): {
  (): BoxData<T>;
  <G extends Selector<T>>(
    selector: G,
    option?: UseSyncBoxStoreOption
  ): ReturnType<G>;
} {
  return function <G extends Selector<T>>(
    selector?: G,
    option?: UseSyncBoxStoreOption
  ): any {
    return typeof selector === "function"
      ? useSyncBoxStore(box, selector, option)
      : useSyncBoxStore(box);
  };
}

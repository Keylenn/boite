import * as React from "react";
import type { ProtectedBox, BoxData, Selector } from "@boxly/core";
import shallowEqual from "./util/shallowEqual";

export interface UseSyncBoxStoreOption {
  shallowCheck?: true;
}

export default function useSyncBoxStore<T extends ProtectedBox>(
  box: T
): BoxData<T>;
export default function useSyncBoxStore<
  T extends ProtectedBox,
  G extends Selector<T>
>(box: T, selector: G, option?: UseSyncBoxStoreOption): ReturnType<G>;
export default function useSyncBoxStore(
  box: ProtectedBox,
  selector?: any,
  { shallowCheck }: any = {}
) {
  const { getData, addListener, removeListener } = box;
  const getState = () =>
    typeof selector === "function" ? selector(getData()) : getData();

  const stateRef = React.useRef(getState());

  const getSnapshot = () => stateRef.current;

  return React.useSyncExternalStore((onStoreChange) => {
    const listener = addListener(() => {
      const newState = getState();

      const shouldUpdate =
        (Boolean(shallowCheck) && shallowEqual(stateRef.current, newState)) ===
        false;

      stateRef.current = newState;

      if (shouldUpdate) onStoreChange();
    });
    return () => removeListener(listener);
  }, getSnapshot);
}

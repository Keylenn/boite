import * as React from "react";
import type { ProtectedBox, BoxData, Selector } from "@boxly/core";
import shallowEqual from "./util/shallowEqual";

export type { ProtectedBox, BoxData, Selector };

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
  box: any,
  selector?: any,
  { shallowCheck }: any = {}
) {
  const { getData, addListener, removeListener } = box;
  const getState = () =>
    typeof selector === "function" ? selector(getData()) : getData();

  const [, forceRender] = React.useReducer((s) => s + 1, 0);
  const stateRef = React.useRef(getState());

  React.useEffect(() => {
    const listener = addListener(() => {
      const newState = getState();

      const check = shallowCheck ? shallowEqual : Object.is;

      const shouldUpdate = check(stateRef.current, newState) === false;

      stateRef.current = newState;

      if (shouldUpdate) forceRender();
    });

    return () => removeListener(listener);
  }, []);

  return getState();
}

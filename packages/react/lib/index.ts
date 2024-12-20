import * as React from 'react'
import type {ProtectedBox, BoxData, GetSnapshot} from "@boxly/core"


export type {ProtectedBox, BoxData, GetSnapshot}

export default function useSyncBoxStore<T extends ProtectedBox>(box: T): BoxData<T>
export default function useSyncBoxStore<T extends ProtectedBox, G extends GetSnapshot<T>>(box: T, getSnapshot: G): ReturnType<G>
export default function useSyncBoxStore(box: ProtectedBox, getSnapshot?: any) {
  const {getData, addListener, removeListener} = box
  const getState = () => typeof getSnapshot === "function" ? getSnapshot(getData()) : getData()

  return React.useSyncExternalStore((listener) => {
    addListener(listener)
    return () => removeListener(listener)
  }, getState);
}
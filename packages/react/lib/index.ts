import * as React from 'react'
import type {ProtectedBox, BoxData, Selector} from "@boxly/core"


export type {ProtectedBox, BoxData, Selector}

interface UseSyncBoxStoreOption {
  shallowCheck?: true
}

export default function useSyncBoxStore<T extends ProtectedBox>(box: T): BoxData<T>
export default function useSyncBoxStore<T extends ProtectedBox, G extends Selector<T>>(box: T, getSnapshot: G, option?: UseSyncBoxStoreOption): ReturnType<G>
export default function useSyncBoxStore(box: ProtectedBox, selector?: any, {shallowCheck}: any = {}) {
  const {getData, addListener, removeListener} = box
  const getState = () => typeof selector === "function" ? selector(getData()) : getData()
  
  const stateRef = React.useRef(getState());

  const getSnapshot = () => stateRef.current

  return React.useSyncExternalStore((onStoreChange) => {
    const listener = addListener(() => {
      const newState = getState();

      const shouldUpdate = (Boolean(shallowCheck) && shallowEqual(stateRef.current, newState)) === false
  
      stateRef.current = newState;

      if(shouldUpdate) onStoreChange()
    })
    return () => removeListener(listener)
  }, getSnapshot);
}


function shallowEqual<T>(objA: T, objB: T): boolean {
  if (objA === objB) return true;
  
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA) as Array<keyof T>;
  const keysB = Object.keys(objB) as Array<keyof T>;
  
  if (keysA.length !== keysB.length) return false;
  
  for (let key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
      return false;
    }
  }
  
  return true;
}
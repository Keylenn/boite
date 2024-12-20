import * as React from 'react'
import type {ProtectedBox, BoxData, GetSnapshot} from "@boxly/core"


export type {ProtectedBox, BoxData, GetSnapshot}

export default function useSyncBoxStore<T extends ProtectedBox>(box: T): BoxData<T>
export default function useSyncBoxStore<T extends ProtectedBox, G extends GetSnapshot<T>>(box: T, getSnapshot: G, {shallowCheck}?: {shallowCheck?: true}): ReturnType<G>
export default function useSyncBoxStore(box: any, getSnapshot?: any, {shallowCheck}: any = {}) {


  const {getData, addListener, addUpdateListener, removeListener} = box
  const getState = () => typeof getSnapshot === "function" ? getSnapshot(getData()) : getData()


  const [, forceRender] = React.useReducer(s => s + 1, 0)
  const stateRef = React.useRef(getState());

  React.useEffect(() => {
    let listener: any = null

    if(shallowCheck) {
      listener = addListener(() => {
        const newState = getState();
        if (!shallowEqual(stateRef.current, newState)) {
          stateRef.current = newState;
          forceRender();
        }
      })
    } else {
      listener = addUpdateListener(() => {
        stateRef.current = getState();
        forceRender()
      }, getState)
    }


    return () => removeListener(listener)
  }, [])

  return getState()
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
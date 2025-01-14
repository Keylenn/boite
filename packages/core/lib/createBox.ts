export type ProtectedBox<T = any> = ReturnType<typeof createBox<T>>;

export type BoxData<T extends ProtectedBox> = ReturnType<T["getData"]>;

export type ProtectedBoxData<T = any> = BoxData<ProtectedBox<T>>;

export type CreateBoxOption<T = any> = {
  onCreated?: (box: ProtectedBox<T>) => void;
  extraStore?: {
    getter?: () =>
      | ProtectedBoxData<T>
      | (() => ProtectedBoxData<T>)
      | Promise<ProtectedBoxData<T> | (() => ProtectedBoxData<T>)>;
    setter?: (data: BoxData<ProtectedBox<T>>) => void | Promise<void>;
  };
};

export default function createBox<
  T,
  D = T extends () => any ? ReturnType<T> : T
>(iData: T, { onCreated, extraStore }: CreateBoxOption<T> = {}) {
  const initialData = typeof iData === "function" ? iData() : iData;

  const box = new Box<D>(initialData);

  function setData<N extends (prev: D) => D>(nextData: N): D;
  function setData<N extends D>(nextData: N): D;
  function setData(next: any) {
    const prevData: D = box.get();
    const nextData = typeof next === "function" ? next(prevData) : next;
    box.set(nextData);
    box.notify();
    return nextData;
  }

  function addUpdateListener(
    handler: (...args: any) => void,
    getDeps: () => any
  ) {
    const defaultDeps = getDeps();
    const listener: Listener = () => {
      const nextDeps = getDeps();
      const prevDeps = listener.deps || defaultDeps;
      const isUpdate = Object.is(prevDeps, nextDeps) === false;
      if (isUpdate) handler();
      listener.deps = nextDeps;
    };
    return box.add(listener);
  }

  const getExtraStoreSnapshotAsync = async () => {
    if (
      typeof extraStore !== "object" ||
      typeof extraStore.getter !== "function"
    ) {
      throw new Error(
        "Please check whether the option parameter is passed into the getter of extraStore."
      );
    }

    try {
      return (await extraStore.getter()) as D;
    } catch (error) {
      console.error("Error in getExtraStoreSnapshotAsync", error);
    }
  };

  const protectedBox = Object.freeze({
    getData: box.get.bind(box) as () => D,
    setData,
    addListener: box.add.bind(box),
    removeListener: box.remove.bind(box),
    addUpdateListener,
    getExtraStoreSnapshotAsync,
  });

  let _isCreated = false;
  const _onCreated = () => {
    if (_isCreated) return;

    if (typeof extraStore === "object") {
      const { getter, setter } = extraStore;

      // Make sure data synchronization is complete before adding effects.
      const tryToHandleEffects = () => {
        _isCreated = true;
        if (typeof setter !== "function") return;
        box.add(() => {
          setter(box.get() as any);
        });
        if (typeof onCreated === "function") {
          onCreated(protectedBox as any);
        }
      };

      if (typeof getter !== "function") return tryToHandleEffects();

      let result = getter() as any;

      const handler = (data: any) => {
        if (data === undefined) return tryToHandleEffects();

        if (typeof data === "function") data = data();
        setData(data);

        tryToHandleEffects();
      };
      result instanceof Promise ? result.then(handler) : handler(result);
    }
  };

  _onCreated();

  return protectedBox;
}

interface Listener {
  (...args: any): void;
  deps?: any;
}

class Box<T> {
  constructor(initialData: T) {
    this.data = initialData;
  }

  private data: T;
  private listeners = new Set<Listener>();

  get() {
    return this.data;
  }

  set(nextData: T) {
    this.data = nextData;
  }

  notify(...args: any[]): void {
    for (const listener of this.listeners) {
      listener(...args);
    }
  }

  add(listener: () => void) {
    this.listeners.add(listener);
    return listener;
  }

  remove(listener: () => void) {
    this.listeners.delete(listener);
  }
}

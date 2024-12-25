import { createSingleBox } from "./index";
import type { ProtectedBox } from "./index";

export interface StorageContext<D = any> {
  getItem: (key: string) => any;
  setItem: (key: string, val: D) => void;
  removeItem: (key: string) => void;
}

type TimeStamp = number;

export interface StorageOptions {
  key: string;
  expires?: TimeStamp | ((lastCommit: TimeStamp) => boolean);
  context?: StorageContext;
}

declare var window: any;

function createStorageBox<T>(iData: T, key: string): ProtectedBox<T>;
function createStorageBox<T>(
  iData: T,
  options: StorageOptions
): ProtectedBox<T>;
function createStorageBox<T>(iData: T, storage: any) {
  if (
    typeof window === "undefined" &&
    (typeof storage === "string" || storage.context === undefined)
  ) {
    throw new Error(
      "The current host environment won't work unless you pass in the correct storage context when creating the storage box."
    );
  }

  const key = typeof storage === "string" ? storage : storage.key;

  const context =
    typeof storage === "object" && storage.context
      ? storage.context
      : window.localStorage;

  const getInitialData = () => {
    const storageDataStr = context.getItem(key);
    try {
      const storageData = JSON.parse(storageDataStr);

      if (typeof storageData === "object") {
        const { value, lastCommit } = storageData;
        if (typeof storage === "object" && storage.expires) {
          const isValid =
            typeof storage.expires === "function"
              ? storage.expires(lastCommit) === false
              : +storage.expires > Date.now();
          if (!isValid) {
            context.removeItem(key);
            return iData;
          }
        }

        return value;
      }
    } catch (error) {
      return iData;
    }
  };

  const box = createSingleBox<T>(getInitialData(), key);

  box.addListener(() => {
    context.setItem(
      key,
      JSON.stringify({
        lastCommit: Date.now(),
        value: box.getData(),
      })
    );
  });

  return box;
}

export default createStorageBox;

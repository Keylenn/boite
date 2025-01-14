import { CreateBoxOption, createSingleBox } from "./index";
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

function createStorageBox<T>(
  key: string,
  createOption?: CreateBoxOption<T>
): ProtectedBox<T>;
function createStorageBox<T>(
  options: StorageOptions,
  createOption?: CreateBoxOption<T>
): ProtectedBox<T>;
function createStorageBox<T>(storage: any, createOption: any) {
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
    try {
      const storageDataStr = context.getItem(key);
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
            return null;
          }
        }

        return value;
      }
    } catch (error) {
      return null;
    }
  };

  const box = createSingleBox<T>(getInitialData(), key, {
    ...createOption,
    onCreated: (b) => {
      b.addListener(() => {
        context.setItem(
          key,
          JSON.stringify({
            lastCommit: Date.now(),
            value: b.getData(),
          })
        );
      });
      if (createOption && typeof createOption.onCreated === "function") {
        createOption.onCreated(b);
      }
    },
  });

  return box;
}

export default createStorageBox;

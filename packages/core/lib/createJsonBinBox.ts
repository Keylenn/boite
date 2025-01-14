import { createSingleBox, CreateBoxOption } from "./index";

const BASE_URL = "https://api.jsonbin.io/v3/b";

declare var window: any;

function createJsonBinBox<T>(
  iData: T,
  option: JsonBinOption,
  createOption?: CreateBoxOption<T>
) {
  const bin = new JsonBin<any>(option);

  const box = createSingleBox<T>(iData, option.binId, {
    ...createOption,
    extraStore: {
      getter: async () => {
        const json = await bin.get().catch(console.error);
        if (json && json.record) {
          return json.record.value;
        }
      },
      setter: (value) => {
        bin.write((prev) => ({
          ...prev.record,
          value,
        }));
      },
    },
  });

  return box;
}

export default createJsonBinBox;

export interface JsonBinOption {
  binId: string;
  apiKey: string;
  accessKey?: string;
  version?: string;
  url?: string;
  request?: RequestLibrary;
  requestInit?: RequestInit;
}

export class JsonBin<T = any> {
  constructor(options: JsonBinOption) {
    this.options = options;
    this.request = options.request || getDefaultRequest();
    this.url =
      options.url ||
      `${BASE_URL}/${this.options.binId}${
        options.version ? `/${options.version}` : ""
      }`;

    this.requestInit = {
      headers: {},
      ...options.requestInit,
    };

    this.requestInit.headers = JSON.parse(
      JSON.stringify({
        "Content-Type": "application/json",
        "X-Master-Key": options.apiKey,
        "X-Access-Key": options.accessKey,
        ...this.requestInit.headers,
      })
    );
  }

  private options: JsonBinOption;
  private requestInit: RequestInit;
  private url: string;
  private request: RequestLibrary;
  private data: T | null = null;

  async get() {
    return this.data ? this.data : await this.read();
  }

  async read() {
    try {
      const response = await this.request(this.url, this.requestInit);

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Error in reading data");
      }
      this.data = json;
      return this.data;
    } catch (error) {
      throw error;
    }
  }
  async write(data: (prev: T | null) => T | T) {
    try {
      const response = await this.request(this.url, {
        method: "PUT",
        body: JSON.stringify(
          typeof data === "function" ? data(this.data) : data
        ),
        ...this.requestInit,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Error in writing data");
      }
      return json;
    } catch (error) {
      throw error;
    }
  }
}

export type RequestLibrary = (
  url: string,
  options?: RequestInit
) => Promise<Response>;

// 默认使用 fetch
function getDefaultRequest(): RequestLibrary {
  if (typeof window === "undefined")
    throw new Error(
      "Please pass in request, because DefaultRequest is not available in the current environment."
    );

  return (url, options) => window.fetch(url, options);
}

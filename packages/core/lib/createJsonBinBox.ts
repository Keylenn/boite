

import {createSingleBox} from './index'


const BASE_URL = 'https://api.jsonbin.io/v3/b';


declare var window: any

async function createJsonBinBox<T>(iData: T, option: JsonBinOption) {
  const bin = new JsonBin<any>(option)

  const getInitialData = async () => {
    try {
      const json = await bin.get()
      return json && json.record && json.record.value ? json.record.value : iData
    
    } catch (error) {
      return iData
    }
  }

  const box = createSingleBox(await getInitialData(), option.binId)

  box.addListener(() => {
    bin.write(prev => ({
      ...prev.record,
      value: box.getData()
    }))
  })

  return box

}

export default createJsonBinBox


export interface JsonBinOption {
  binId: string
  apiKey: string
  accessKey?: string
  version?: string
  url?: string
  request?: RequestLibrary
  requestInit?: RequestInit
}

export class JsonBin<T = any> {
  constructor(options: JsonBinOption) {
      this.options = options
      this.request = options.request || getDefaultRequest()
      this.url = options.url || `${BASE_URL}/${this.options.binId}${options.version ? `/${options.version}` : ''}`

      this.requestInit = {
          headers: {},
          ...options.requestInit
      }

      this.requestInit.headers = JSON.parse(JSON.stringify({
          'Content-Type': 'application/json',
          'X-Master-Key': options.apiKey,
          'X-Access-Key': options.accessKey,
          ...this.requestInit.headers
      }))
  }

  private options: JsonBinOption
  private requestInit: RequestInit
  private url: string
  private request: RequestLibrary
  private data: T | null = null

  async get() {
      return this.data ? this.data : await this.read()
  }

  async read () {
      try {
          const response = await this.request(this.url, this.requestInit);
          
          if (!response.ok) {
              throw new Error('Error in reading data');
          }
          this.data = await response.json()
          return this.data;
          } catch (error) {
              console.error('Error in reading data', error);
              throw error;
          }
  }
  async write(data:(prev: T | null) => T | T) {
      try {

          const response = await this.request(this.url, {
              method: 'PUT',
              body: JSON.stringify(typeof data === "function" ? data(this.data) : data),
              ...this.requestInit,
          });
          if (!response.ok) {
              throw new Error('Error in writing data');
          }
          return await response.json();
          } catch (error) {
              console.error('Error in writing data:', error);
              throw error;
          }
  }
}



export type RequestLibrary = (url: string, options?: RequestInit) => Promise<Response>;


// 默认使用 fetch
function getDefaultRequest(): RequestLibrary {
  if(typeof window === 'undefined') throw new Error("Please pass in request, because DefaultRequest is not available in the current environment.")

 return (url, options) => window.fetch(url, options)
};
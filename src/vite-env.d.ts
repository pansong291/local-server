/// <reference types="vite/client.d.ts" />
/// <reference types="utools-api-types" />
import { ServerInfo, StartServerConfig } from '../utools/src/types'

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    utools: UToolsApi
    _cache: {
      globalMimeFunction?: Function
    }
    _preload: {
      startServer: (config: StartServerConfig) => Promise<ServerInfo>
      isDirectory: (p: string) => boolean
    }
    _servers: Record<string, ServerInfo>
  }
}

/// <reference types="vite/client.d.ts" />
/// <reference types="utools-api-types" />
import { ServerInfo, StartServerConfig } from '@/preload/types'
import { Server } from 'net'

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'http-shutdown' {
  interface WithShutdown extends Server {
    shutdown(cb?: (err?: Error) => any): void;
    forceShutdown(cb?: (err?: Error) => any): void;
  }
}

declare global {
  interface Window {
    utools: UToolsApi
    _preload: {
      startServer: (config: StartServerConfig) => Promise<ServerInfo>
    }
    _servers: Record<string, ServerInfo>
  }
}

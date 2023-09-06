import { ServerInfo, StartServerConfig } from './types'

declare global {
  interface Window {
    _cache: {
      globalMimeFunction?: (p: string, m: string) => string
    }
    _preload: {
      startServer: (config: StartServerConfig) => Promise<ServerInfo>
      isDirectory: (p: string) => boolean
    }
  }
}

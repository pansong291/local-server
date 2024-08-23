import { Server } from 'net'

export type Protocol = 'http' | 'https'

export type NetFamily = 'IPv4' | 'IPv6'

export type IPAddress = {
  address: string
  family: NetFamily
  internal: boolean
}

export type StartServerConfig = {
  base: string
  port?: number
  net: {
    family?: NetFamily
    internal?: boolean
    https?: boolean
  }
  cors?: boolean
  showDir?: boolean
  /**
   * 完整的函数声明
   */
  mapPath?: string
}

export type ServerInfo = {
  protocol: Protocol
  address: Array<IPAddress>
  port: number
  shutdown: () => Promise<any>
}

export interface WithShutdown extends Server {
  shutdown(cb?: (err?: Error) => any): void

  forceShutdown(cb?: (err?: Error) => any): void
}

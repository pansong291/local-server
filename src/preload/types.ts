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
  }
  cors?: boolean
  showDir?: boolean
}

export type ServerInfo = {
  address: Array<IPAddress>
  port: number
  shutdown: () => Promise<any>
}

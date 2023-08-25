export type ConfigItem = {
  id: string,
  base: string
  port?: number
  netFamily: 'IPv4' | 'IPv6' | 'all'
  netInterface: 'inner' | 'outer' | 'all'
  cors?: boolean
  showDir: 'default' | 'always' | 'never'
}

export type StatedConfigItem = {
  state?: boolean,
  config: ConfigItem
}

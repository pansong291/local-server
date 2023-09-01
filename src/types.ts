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
  running?: boolean,
  config: ConfigItem
}

export enum StorageKey {
  SERVER_LIST = 'server-list',
  ACTIVE_ITEM = 'active-item'
}

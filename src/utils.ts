import { ConfigItem } from '@/types'

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function newConfigItem(path?: string): ConfigItem {
  return {
    id: uuid(),
    base: path || '',
    netFamily: 'IPv4',
    netInterface: 'inner',
    showDir: 'default'
  }
}

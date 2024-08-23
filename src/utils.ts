import { ConfigItem, StorageKey } from '@/types'

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function newConfigItem(path?: string, old?: ConfigItem): ConfigItem {
  return {
    id: old?.id || uuid(),
    base: path || old?.base || '',
    netFamily: old?.netFamily || 'IPv4',
    netInterface: old?.netInterface || 'inner',
    netProtocol: old?.netProtocol || 'http',
    showDir: old?.showDir || 'default',
    cors: old?.cors || undefined,
    port: old?.port || undefined,
    mapPath: old?.mapPath || undefined
  }
}

export const mimeFuncPrefix = 'function (p, m) {'
export const mapPathFuncPrefix = 'function (p) {'
export const commonFuncSuffix = '}'

export function getMimeFunction(content: string) {
  return new Function(`return ${mimeFuncPrefix}${content}${commonFuncSuffix}`)()
}

export function getMapPathFunction(content: string) {
  return new Function(`return ${mapPathFuncPrefix}${content}${commonFuncSuffix}`)()
}

export function saveStorage(key: StorageKey, obj: any) {
  if (obj !== window.utools.dbStorage.getItem(key)) {
    window.utools.dbStorage.setItem(key, obj)
  }
}

export function getStorage(key: StorageKey) {
  return window.utools?.dbStorage.getItem(key)
}

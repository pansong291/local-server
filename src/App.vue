<template>
  <el-container>
    <el-header>
      <el-space alignment="center" size="large">
        <el-button :icon="Plus" type="primary" circle @click="addConfigItem('', true)" />
        <el-button :icon="Setting" circle @click="drawerOpened = true" />
        <el-switch
          :style="`--el-switch-on-color: #2c2c2c; --el-switch-off-color: #f2f2f2; --el-switch-border-color: var(--el-border-color);`"
          :model-value="isDark"
          @change="(_) => toggleDark(!!_)"
          :active-action-icon="IconDark"
          :inactive-action-icon="IconLight" />
      </el-space>
    </el-header>
    <el-main>
      <el-collapse v-if="!!stateItems?.length" v-model="activeName" accordion>
        <el-collapse-item v-for="item in stateItems" :key="item.config.id" :name="item.config.id">
          <template #title>
            <el-space>
              <el-tag v-if="item.running" type="success" effect="plain" round>运行中</el-tag>
              <el-tag v-else type="info" effect="plain" round>未启动</el-tag>
              {{ activeName === item.config.id ? '' : item.config.base }}
            </el-space>
          </template>
          <el-card shadow="hover">
            <server-item
              v-model:config="item.config"
              :start-active="item.running"
              @activeChange="(_) => (item.running = _)"
              @delete="deleteItem(item.config.id)" />
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-main>
  </el-container>
  <el-drawer v-model="drawerOpened" direction="rtl" size="70%" :with-header="false">
    <div class="drawer-title-line">
      <el-text tag="h1" size="large">设置文件 MIME 类型</el-text>
      <el-space>
        <el-button type="primary" plain @click="onDrawerOkClick" :disabled="!mimeFuncInfo.func">确定</el-button>
        <el-button plain @click="functionText = globalMimeFuncStr">重置</el-button>
        <el-button text circle :icon="Close" @click="drawerOpened = false" />
      </el-space>
    </div>
    <tip-box type="primary">
      <ul>
        <li>参数 <code>p</code> 为文件路径，<code>m</code> 为内置默认 MIME 类型</li>
        <li>返回值应为该文件对应的 MIME 类型，也可返回任意假值或不返回，该值将直接应用于响应头中的 Content-Type</li>
        <li>可使用 <code>throw</code> 语句观察表达式的值，例如 <code>throw 1 + 2</code></li>
      </ul>
    </tip-box>
    <func-textarea v-model="functionText" @update:validate="(_) => (mimeFuncInfo = _)" />
    <tip-box v-if="!mimeFuncInfo.func" type="error">
      <p class="monospace">{{ mimeFuncInfo.errMsg }}</p>
    </tip-box>
  </el-drawer>
</template>

<script setup lang="ts">
import IconLight from '@/components/icon/IconLight.vue'
import IconDark from '@/components/icon/IconDark.vue'
import { Close, Plus, Setting } from '@element-plus/icons-vue'
import { isDark, toggleDark } from '@/composables'
import ServerItem from '@/components/ServerItem.vue'
import { Ref } from 'vue'
import { ConfigItem, StatedConfigItem, StorageKey } from '@/types'
import { getMimeFunction, getStorage, newConfigItem, saveStorage } from '@/utils'
import FuncTextarea, { FunctionValidateInfo } from '@/components/FuncTextarea.vue'
import TipBox from '@/components/TipBox.vue'

const activeName: Ref<string> = ref('')
const stateItems: Ref<Array<StatedConfigItem>> = ref([])
const drawerOpened: Ref<boolean> = ref(false)
const globalMimeFuncStr: Ref<string> = ref('')
const functionText: Ref<string> = ref('')
const mimeFuncInfo: Ref<FunctionValidateInfo> = ref({})

function addConfigItem(path?: string, active?: boolean) {
  const statItem: StatedConfigItem = {
    config: newConfigItem(path)
  }
  stateItems.value.push(statItem)
  if (active) {
    activeName.value = statItem.config.id
  }
}

function deleteItem(id: string) {
  const ind = stateItems.value.findIndex((it) => it.config.id === id)
  if (ind >= 0) {
    stateItems.value.splice(ind, 1)
  }
}

function onDrawerOkClick() {
  if (mimeFuncInfo.value.func) {
    // 记录经过验证的函数内容并把函数挂载到 window 上
    globalMimeFuncStr.value = functionText.value
    window._cache.globalMimeFunction = mimeFuncInfo.value.func
    drawerOpened.value = false
  }
}

onBeforeMount!(() => {
  const mimeFuncStr = getStorage(StorageKey.GLOBAL_MIME_FUNC)
  if (mimeFuncStr || mimeFuncStr === '') {
    globalMimeFuncStr.value = mimeFuncStr
  } else {
    globalMimeFuncStr.value = `if (/\\btext\\b|.script/g.test(m))\n    return m + ';charset=utf-8'`
  }
  // 初始化函数, 由于 drawer 是懒加载, 需要手动把函数挂载到 window 上
  functionText.value = globalMimeFuncStr.value
  try {
    window._cache.globalMimeFunction = getMimeFunction(globalMimeFuncStr.value)
  } catch (e) {
    console.warn(e)
  }

  const runningServers = new Set()
  const runningListStr = getStorage(StorageKey.RUNNING_SERVERS)
  if (runningListStr) {
    try {
      const runningList: Array<string> = JSON.parse(runningListStr)
      if (Array.isArray(runningList)) {
        for (const r of runningList) {
          runningServers.add(r)
        }
      }
    } catch (e) {}
  }

  const serverListStr = getStorage(StorageKey.SERVER_LIST)
  if (serverListStr) {
    try {
      const serverList: Array<ConfigItem> = JSON.parse(serverListStr)
      if (Array.isArray(serverList)) {
        for (const server of serverList) {
          stateItems.value.push({
            running: runningServers.has(server.id),
            config: newConfigItem(undefined, server)
          })
        }
      }
    } catch (e) {}
  }

  const activeItem = getStorage(StorageKey.ACTIVE_ITEM)
  if (activeItem) activeName.value = activeItem
})

window.utools?.onPluginEnter((action) => {
  console.log('active by action:', action)
  if (action.code === 'add-server') {
    switch (action.type) {
      case 'files':
        if (action.payload?.length) {
          for (const item of action.payload) {
            if (item.isDirectory) {
              addConfigItem(item.path, true)
            }
          }
        }
        break
      case 'window':
        if (action.payload?.app) {
          window.utools.readCurrentFolderPath().then((dir) => {
            addConfigItem(dir, true)
          })
        }
        break
    }
  }
})
window.utools?.onPluginOut((processExit) => {
  if (processExit) {
    saveStorage(StorageKey.GLOBAL_MIME_FUNC, globalMimeFuncStr.value)
    saveStorage(StorageKey.RUNNING_SERVERS, JSON.stringify(stateItems.value.filter((it) => it.running).map((it) => it.config.id)))
    saveStorage(StorageKey.SERVER_LIST, JSON.stringify(stateItems.value.map((it) => it.config)))
    saveStorage(StorageKey.ACTIVE_ITEM, activeName.value)
    Object.values(window._servers).forEach((info) => {
      info.shutdown()
    })
    window._servers = {}
  }
})
</script>

<style scoped lang="scss">
:deep(.el-button.is-circle.is-text) {
  width: 32px;
}

:deep(.el-header) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid var(--el-border-color);
}

.drawer-title-line {
  display: flex;
  justify-content: space-between;
}
</style>

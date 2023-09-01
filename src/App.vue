<template>
  <el-container>
    <el-header>
      <el-space alignment="center" size="large">
        <el-button :icon="Plus" type="primary" circle @click="addConfigItem('', true)" />
        <el-switch
          :style="`--el-switch-on-color: #2c2c2c; --el-switch-off-color: #f2f2f2; --el-switch-border-color: var(--el-border-color);`"
          :model-value="isDark"
          @change="toggleDark"
          :active-action-icon="IconDark"
          :inactive-action-icon="IconLight" />
      </el-space>
    </el-header>
    <el-main>
      <el-collapse v-if="!!(stateItems?.length)" v-model="activeName" accordion>
        <el-collapse-item v-for="item in stateItems" :key="item.config.id" :name="item.config.id">
          <template #title>
            <el-space>
              <el-tag v-if="item.running" type="success" effect="plain" round>运行中</el-tag>
              <el-tag v-else type="info" effect="plain" round>未启动</el-tag>
              {{ activeName === item.config.id ? '' : item.config.base }}
            </el-space>
          </template>
          <el-card shadow="hover">
            <server-item v-model:config="item.config" @activeChange="(_) => item.running = _" @delete="deleteItem(item.config.id)" />
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import IconLight from '@/components/icon/IconLight.vue'
import IconDark from '@/components/icon/IconDark.vue'
import { Plus } from '@element-plus/icons-vue'
import { isDark, toggleDark } from '@/composables'
import ServerItem from '@/components/ServerItem.vue'
import { Ref } from 'vue'
import { StatedConfigItem, StorageKey } from '@/types'
import { newConfigItem } from '@/utils'

const activeName: Ref<string> = ref('1')
const stateItems: Ref<Array<StatedConfigItem>> = ref([])

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

onBeforeMount!(() => {
  const serverListStr = window.utools.dbStorage.getItem(StorageKey.SERVER_LIST)
  if (serverListStr) {
    try {
      const serverList = JSON.parse(serverListStr)
      if (Array.isArray(serverList)) {
        for (const server of serverList) {
          stateItems.value.push({
            config: newConfigItem(undefined, server)
          })
        }
      }
    } catch (e) {
    }
  }
  const activeItem = window.utools.dbStorage.getItem(StorageKey.ACTIVE_ITEM)
  if (activeItem) activeName.value = activeItem
})

window.utools?.onPluginEnter((action) => {
  console.log('active with action:', action)
  if (action.code === 'add-server') {
    switch (action.type) {
      case 'files':
        if (action.payload?.length) {
          for (const item of action.payload) {
            if (item.isDirectory) {
              console.log(item.path)
              addConfigItem(item.path, true)
            }
          }
        }
        break
      case 'window':
        if (action.payload?.app) {
          window.utools.readCurrentFolderPath().then((dir) => {
            console.log(dir)
            addConfigItem(dir, true)
          })
        }
        break
    }
  }
})
window.utools?.onPluginOut((processExit) => {
  if (processExit) {
    const newListStr = JSON.stringify(stateItems.value.map(it => it.config))
    if (newListStr !== window.utools.dbStorage.getItem(StorageKey.SERVER_LIST)) {
      window.utools.dbStorage.setItem(StorageKey.SERVER_LIST, newListStr)
    }
    if (activeName.value !== window.utools.dbStorage.getItem(StorageKey.ACTIVE_ITEM)) {
      window.utools.dbStorage.setItem(StorageKey.ACTIVE_ITEM, activeName.value)
    }
    Object.values(window._servers).forEach(info => {
      info.shutdown()
    })
    window._servers = void 0
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
</style>

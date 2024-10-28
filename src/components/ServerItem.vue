<template>
  <el-form label-position="right" label-width="6em">
    <el-form-item label="目录">
      <el-input
        v-model="data.base"
        readonly
        placeholder="拖动文件夹到此处或点击选择目录"
        @click="chooseDir"
        :disabled="waiting || !!serverInfo"
        @dragover.prevent
        @drop.prevent="getDragDir">
        <template #append>
          <el-button @click="toggleServer" :loading="waiting">{{ serverInfo ? '停止' : '启动' }}</el-button>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
  <el-form :model="data" label-position="right" label-width="6em" inline :disabled="waiting || !!serverInfo">
    <el-form-item label="端口号">
      <el-input-number v-model="data.port" :min="0" :max="65535" :precision="0" placeholder="随机" />
    </el-form-item>
    <el-form-item label="网络协议">
      <el-radio-group v-model="data.netFamily">
        <el-radio-button label="IPv4">IPv4</el-radio-button>
        <el-radio-button label="IPv6">IPv6</el-radio-button>
        <el-radio-button label="all">全部</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="网络接口">
      <el-radio-group v-model="data.netInterface">
        <el-radio-button label="inner">内部</el-radio-button>
        <el-radio-button label="outer">外部</el-radio-button>
        <el-radio-button label="all">全部</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="通信协议">
      <el-radio-group v-model="data.netProtocol">
        <el-radio-button label="http">HTTP</el-radio-button>
        <el-radio-button label="https">HTTPS</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="显示目录">
      <el-radio-group v-model="data.showDir">
        <el-radio-button label="default">默认</el-radio-button>
        <el-radio-button label="always">始终</el-radio-button>
        <el-radio-button label="never">永不</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="允许跨域">
      <el-switch v-model="data.cors" />
    </el-form-item>
    <el-form-item>
      <el-button @click="emit('setMapPath', data.id)">路径映射</el-button>
    </el-form-item>
    <el-form-item>
      <el-button @click="emit('delete', data.id)" type="danger">删除</el-button>
    </el-form-item>
  </el-form>
  <el-card v-if="!!links?.length" shadow="never">
    <div v-for="link in links">
      <el-link v-if="link.internal" type="primary" @click="openUrl(link.url)">{{ link.url }}</el-link>
      <el-popover v-else placement="top">
        <template #reference>
          <el-link type="primary" @click="openUrl(link.url)">{{ link.url }}</el-link>
        </template>
        <template #default>
          <canvas :data-url="link.url" ref="qrcodeCanvas" />
        </template>
      </el-popover>
    </div>
  </el-card>
  <tip-box v-if="!!msg" type="error">
    <div>{{ msg }}</div>
  </tip-box>
</template>

<script setup lang="ts">
import qrcode from 'qrcode'
import TipBox from '@/components/TipBox.vue'
import { ConfigItem } from '@/types'
import { Ref } from 'vue'
import { ServerInfo } from '@/../utools/src/types'
import { commonFuncSuffix, mapPathFuncPrefix } from '@/utils'

const props = defineProps<{
  config: ConfigItem
  startActive?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:config', d: ConfigItem): void
  (e: 'activeChange', d: boolean): void
  (e: 'delete', id: string): void
  (e: 'setMapPath', id: string): void
}>()

const data = computed!({
  get() {
    return props.config
  },
  set(d) {
    emit('update:config', d)
  }
})
const waiting: Ref<boolean> = ref(false)
const serverInfo: Ref<ServerInfo | undefined> = ref()
const msg: Ref<string> = ref('')
const qrcodeCanvas: Ref<Array<HTMLCanvasElement> | null> = ref(null)
const links = computed!(() => {
  if (!serverInfo.value) return
  return serverInfo.value!.address?.map((a) => ({
    url: `${serverInfo.value!.protocol}://${a.address}:${serverInfo.value!.port}`,
    internal: a.internal
  }))
})

function chooseDir() {
  const folders = utools.showOpenDialog({
    title: '选择文件夹',
    buttonLabel: '选择文件夹',
    defaultPath: data.value.base,
    properties: ['openDirectory', 'dontAddToRecent']
  })
  if (folders?.[0]) {
    data.value.base = folders![0]
  }
}

function getDragDir(e: DragEvent) {
  if (waiting.value || serverInfo.value) return
  const file: any = e.dataTransfer?.files?.[0]
  if (file?.path && window._preload.isDirectory(file.path)) {
    data.value.base = file.path
  }
}

function toggleServer() {
  msg.value = ''
  waiting.value = true
  if (serverInfo.value) {
    serverInfo
      .value!.shutdown()
      .then(() => {
        serverInfo.value = undefined
        delete window._servers[data.value.id]
        emit('activeChange', false)
      })
      .catch((e) => {
        msg.value = String(e)
      })
      .finally(() => {
        waiting.value = false
      })
  } else {
    window._preload
      .startServer({
        base: data.value.base,
        port: data.value.port,
        net: {
          family: data.value.netFamily === 'all' ? undefined : data.value.netFamily,
          internal: data.value.netInterface === 'all' ? undefined : data.value.netInterface === 'inner',
          https: data.value.netProtocol === 'https'
        },
        showDir: data.value.showDir === 'default' ? undefined : data.value.showDir === 'always',
        cors: data.value.cors,
        mapPath: `${mapPathFuncPrefix}${data.value.mapPath || ''}${commonFuncSuffix}`
      })
      .then((info) => {
        serverInfo.value = info
        window._servers[data.value.id] = info
        emit('activeChange', true)
      })
      .catch((e) => {
        msg.value = String(e)
      })
      .finally(() => {
        waiting.value = false
      })
  }
}

function openUrl(url: string) {
  window.utools.shellOpenExternal(url)
}

onMounted!(() => {
  if (props.startActive) {
    toggleServer()
  }
})

watchPostEffect!(() => {
  if (qrcodeCanvas.value?.length) {
    for (const canvas of qrcodeCanvas.value) {
      if (canvas) {
        qrcode.toCanvas(canvas, canvas.dataset['url']!, {
          margin: 1,
          width: 124,
          scale: 4
        })
      }
    }
  }
})
</script>

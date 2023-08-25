import { defineConfig } from 'vite'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import optimizer from 'vite-plugin-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    optimizer((() => {
      const externalModels = ['os', 'fs', 'path', 'http', 'url', 'https']
      const result = {}
      for (let item of externalModels) {
        result[item] = () => {
          const fieldName = item.replaceAll(/-([a-zA-Z])/g, (match, p1) => p1.toUpperCase())
          return {
            find: new RegExp(`^(node:)?${item}$`),
            code: `const ${fieldName} = require('${item}');export { ${fieldName} as default }`
          }
        }
      }
      return result
    })()),
    vue(),
    autoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon'
        })
      ]
    }),
    components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep']
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 10987
  },
  build: {
    outDir: 'utools/dist',
    rollupOptions: {
      input: {
        preload: path.join(__dirname, 'src/preload/index.ts'),
        main: path.join(__dirname, 'index.html')
      },
      output: {
        entryFileNames: (info) => {
          return info.name === 'preload' ? '[name].js' : 'assets/[name]-[hash].js'
        }
      }
    }
  }
})

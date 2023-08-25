import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/index.scss'

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss'

window._servers = {}
const app = createApp(App)
app.mount('#app')

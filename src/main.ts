import 'reflect-metadata';
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router';
import 'element-plus/theme-chalk/dark/css-vars.css'

// GitHub 마크다운 CSS 추가
import 'github-markdown-css/github-markdown-dark.css'


const app = createApp(App)
app.use(router);
app.use(ElementPlus)
app.mount('#app')
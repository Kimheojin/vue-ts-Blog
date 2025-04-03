import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router';
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'reflect-metadata';

const app = createApp(App)
app.use(router);
app.use(ElementPlus)
app.mount('#app')
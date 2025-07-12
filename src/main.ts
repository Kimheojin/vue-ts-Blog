import 'reflect-metadata';
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router';
import 'element-plus/theme-chalk/dark/css-vars.css'

// GitHub 마크다운 CSS 추가
import 'github-markdown-css/github-markdown-dark.css'

// highlight.js 추가
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';

// 자바와 bash만 등록
import java from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('java', java);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash); // sh도 bash로 처리
// 전역으로 hljs 사용 가능하게 설정
(window as any).hljs = hljs;


const app = createApp(App)
app.use(router);
app.use(ElementPlus)
app.mount('#app')
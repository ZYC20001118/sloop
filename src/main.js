import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Layout, Breadcrumb } from 'ant-design-vue';

import './assets/css/global.css'

const app = createApp(App)

app.use(router)

app.use(Layout);
app.use(Breadcrumb);

app.mount('#app')

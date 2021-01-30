import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Layout, Breadcrumb, Table, Result, Button, Card } from 'ant-design-vue'

const app = createApp(App)

app.use(router)

app.use(Layout)
app.use(Breadcrumb)
app.use(Table)
app.use(Result)
app.use(Button)
app.use(Card)

app.mount('#app')

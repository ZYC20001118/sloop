import { createApp } from 'vue'
import App from './App'
import router from './router'

import { Layout, Breadcrumb, Table, Result, Button, Card, BackTop } from 'ant-design-vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'

const app = createApp(App)

app.use(router)

app
  .use(Layout)
  .use(Breadcrumb)
  .use(Table)
  .use(Result)
  .use(Button)
  .use(Card)
  .use(BackTop)

app.mount('#app')

createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2345698_exraojeyqwd.js' // 在 iconfont.cn 上生成
})

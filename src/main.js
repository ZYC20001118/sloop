import { createApp } from 'vue'
import App from './App'
import router from './router'

import { Layout, Row, Col, Breadcrumb, Table, Result, Button, Card, BackTop, Spin, Image, Input, Form } from 'ant-design-vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'

createApp(App)
  .use(router)
  .use(Layout)
  .use(Row)
  .use(Col)
  .use(Breadcrumb)
  .use(Table)
  .use(Result)
  .use(Button)
  .use(Card)
  .use(BackTop)
  .use(Spin)
  .use(Image)
  .use(Input)
  .use(Form)
  .mount('#app')

createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2345698_exraojeyqwd.js' // 在 iconfont.cn 上生成
})

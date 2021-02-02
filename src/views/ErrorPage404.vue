<template>
  <a-result status="404" title="404" sub-title="抱歉，您要访问的页面不存在！">
    <template #extra>
      <a-button v-if="backNum" type="primary" @click="router.go(backNum)">
        返回上一页
      </a-button>
      <a-button type="primary" @click="router.push('/')">
        返回首页
      </a-button>
    </template>
  </a-result>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
export default {
  setup() {
    document.title = '404 Not Found'
    const route = useRoute()
    const router = useRouter()
    const backNum = typeof route.query.i != undefined ? route.query.i : false
    return { route, router, backNum }
  }
}
</script>

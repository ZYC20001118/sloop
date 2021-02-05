<template>
  <a-result status="404" title="404" sub-title="抱歉，您要访问的页面不存在！">
    <template #extra>
      <a-button v-if="showBack" type="primary" @click="router.go(-1)">
        返回上一页
      </a-button>
      <a-button type="primary" @click="router.push({ name: 'Index' })">
        返回首页
      </a-button>
    </template>
  </a-result>
</template>

<script>
import { useRouter } from 'vue-router'
export default {
  setup() {
    document.title = '404 Not Found'
    const router = useRouter()
    const showBack = window.history.length > 1
    return { router, showBack }
  }
}
</script>

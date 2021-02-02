<template>
  <a-result status="404" title="404" sub-title="抱歉，您要访问的页面不存在！">
    <template #extra>
      <a-button type="primary" @click="router.push('/')">
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
    return { router }
  }
}
</script>

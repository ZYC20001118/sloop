<template>
  <div class="head-nav">
    <a-breadcrumb :routes="routes">
      <template #itemRender="{ route, routes }">
        <span v-if="routes.indexOf(route) === routes.length - 1">
          {{ route.breadcrumbName }}
        </span>
        <router-link v-else :to="route.path">
          {{ route.breadcrumbName }}
        </router-link>
      </template>
    </a-breadcrumb>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  name: 'HeadNav',
  props: {
    title: String
  },
  setup(props) {
    const data = reactive({
      routes: []
    })
    const init = () => {
      const paths = location.pathname.substr(1).split('/')
      let routes = [
        {
          path: '/',
          breadcrumbName: props.title
        }
      ]
      paths.map(val => {
        if (val == '') {
          return false
        }
        routes.push({
          path: `${routes[routes.length - 1].path}${val}/`,
          breadcrumbName: decodeURIComponent(val)
        })
      })
      data.routes = routes
    }
    init()
    return {
      ...toRefs(data),
      init
    }
  }
}
</script>

<style scoped lang="less">
.head-nav {
  position: relative;
  z-index: 1;
  :hover {
    .ant-breadcrumb {
      overflow-x: auto;
    }
  }
  ::v-deep(.ant-breadcrumb) {
    display: flex;
    overflow: hidden;
    height: 56px;
    line-height: 56px;
    font-size: 20px;
    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      .ant-breadcrumb-separator {
        margin: 0 4px;
      }
    }
  }
}
</style>

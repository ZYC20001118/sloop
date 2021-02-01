<template>
  <div class="nav">
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
    <div class="extra">
      <a :href="data.url" target="_blank" v-if="data.page == 'detail'">
        <svg aria-hidden="true" focusable="false">
          <use xlink:href="#icon-download"></use>
        </svg>
      </a>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  name: 'HeadNav',
  props: {
    data: Object
  },
  setup(props) {
    const data = reactive({
      data: props.data,
      routes: []
    })
    const init = () => {
      if (process.env.NODE_ENV === 'development') {
        data.data = props.data
      }
      const paths = location.pathname.substr(1).split('/')
      let routes = [
        {
          path: '/',
          breadcrumbName: data.data.title
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
.nav {
  position: relative;
  display: flex;
  z-index: 1;
  height: 56px;
  line-height: 56px;
  ::v-deep(.ant-breadcrumb) {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
    font-size: 20px;
    &:hover {
      overflow-x: auto !important;
    }
    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      .ant-breadcrumb-separator {
        margin: 0 4px;
      }
    }
  }
  .extra {
    a {
      margin-left: 8px;
      svg {
        height: 36px;
        width: 36px;
        vertical-align: middle;
      }
    }
  }
}
</style>

<template>
  <a-row class="nav" type="flex">
    <a-breadcrumb :routes="routes" ref="refNav">
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
  </a-row>
</template>

<script>
import { reactive, toRefs, watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'HeadNav',
  props: {
    data: Object
  },
  setup(props) {
    const route = useRoute()
    const data = reactive({
      routes: []
    })
    const refNav = ref(0)
    const init = () => {
      new Promise(resolve => {
        data.data = props.data
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
        resolve()
      }).then(() => {
        if (refNav.value != null) {
          refNav.value.$el.scrollLeft = 999999 // 加载完成后滚动条滚到最右边
        }
      })
    }
    watch(
      () => route.path,
      () => {
        init()
      }
    )
    onMounted(() => {
      init()
    })
    return {
      ...toRefs(data),
      refNav
    }
  }
}
</script>

<style scoped lang="less">
.nav {
  position: relative;
  flex-flow: row;
  z-index: 1;
  height: 56px;
  line-height: 56px;
  ::v-deep(.ant-breadcrumb) {
    flex: 1;
    height: inherit;
    line-height: inherit;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    font-size: 20px;
    &::-webkit-scrollbar {
      display: none;
      height: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background: #636e72;
    }
    &::-webkit-scrollbar-track {
      background: #d6dadc;
    }
    &:hover {
      overflow-x: auto;
      &::-webkit-scrollbar {
        display: block;
      }
    }
    span {
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

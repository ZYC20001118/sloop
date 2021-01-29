<template>
  <a-layout id="components-layout-demo-top" class="layout">
    <a-layout-content>
      <div class="breadcrumb">
        <a-breadcrumb class="warp" :routes="routes">
          <template #itemRender="{ route, params, routes, paths }">
            <span v-if="routes.indexOf(route) === routes.length - 1">
              {{ route.breadcrumbName }}
            </span>
            <router-link v-else :to="`/${route.path}`">
              {{ route.breadcrumbName }}
            </router-link>
          </template>
        </a-breadcrumb>
      </div>
      <div class="warp" :style="{ background: '#fff', padding: '24px', minHeight: '280px' }">
        Content
        <slot name="listRender"></slot>
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      Ant Design ©2018 Created by Ant UED
    </a-layout-footer>
  </a-layout>
</template>

<script>
export default {
  watch: {
    $route(to, from) {
      this.init();
    },
  },
  data() {
    return {
      ...data,
      routes: [],
    };
  },
  methods: {
    init() {
      this.breadcrumb();
    },
    breadcrumb() {
      const paths = location.pathname.substr(1).split("/");
      let routes = [
        {
          path: "/",
          breadcrumbName: this.title,
        },
      ];
      paths.map((val) => {
        if (val == "") {
          return false;
        }
        routes.push({
          path: routes[routes.length - 1].path + `${val}/`,
          breadcrumbName: val,
        });
      });
      this.routes = routes;
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped lang="less">
.layout {
  background: #fff;
}
.warp {
  max-width: 980px;
  margin: 0 auto;
}
.breadcrumb {
  background: #f5f6fa;
  .warp {
    height: 56px;
    line-height: 56px;
    font-size: 20px;
  }
}
</style>

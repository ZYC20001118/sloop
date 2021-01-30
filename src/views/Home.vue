<template>
  <a-layout id="components-layout-demo-top" class="layout">
    <a-layout-content>
      <!-- 面包屑导航 -->
      <div class="head-nav">
        <div class="warp">
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
      </div>
      <!-- 文件列表 -->
      <div class="file-list" v-show="data.page == 'list'">
        <a-table
          class="warp"
          :columns="columns"
          :customRow="customRow"
          :data-source="data.list"
          :pagination="false"
          :loading="file_list_loading"
          rowKey="href"
        >
          <template #nameTitle>
            <div class="table-title">文件名</div>
          </template>
          <template #sizeTitle>
            <div class="table-title">大小</div>
          </template>
          <template #timeTitle>
            <div class="table-title">修改时间</div>
          </template>
          <template #name="{ text, record }">
            <svg aria-hidden="true" focusable="false">
              <use :xlink:href="'#icon-' + record.type"></use>
            </svg>
            {{ text }}
          </template>
          <template #size="{ text }">
            {{ text || '-' }}
          </template>
          <template #time="{ text }">
            {{ text || '-' }}
          </template>
        </a-table>
      </div>
      <!-- 预览页面 -->
      <div class="preview" v-show="data.page == 'detail'">
        <!-- 视频预览 -->
        <div id="video-preview" v-show="data.type == 'video'"></div>
        <!-- 图片预览 -->
        <img v-if="data.type == 'image'" :src="data.url" />
      </div>
      <!-- 自诉文件 -->
      <div v-if="data.readme" class="readme warp">
        <a-card title="README.md">
          <article class="markdown-body" v-html="data.readme"></article>
        </a-card>
      </div>
    </a-layout-content>
    <!-- 页脚 -->
    <a-layout-footer v-if="data.page == 'list'">
      <div class="warp">
        <p>Powered by sharelist | Theme by lmy</p>
        <p><a href="/manage" target="_blank">管理</a></p>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { getList } from '../utils/api'
import { queryURLparams } from '../utils/base'
import { byte } from '../utils/format'
import { message } from 'ant-design-vue'
import DPlayer from 'dplayer'

export default {
  watch: {
    $route() {
      this.updateFileList()
    }
  },
  data() {
    return {
      data: typeof window.data == 'undefined' ? [] : window.data,
      columns: [
        {
          align: 'left',
          dataIndex: 'name',
          slots: { title: 'nameTitle', customRender: 'name' },
          sorter: (a, b) => {
            return a.name < b.name ? 1 : -1
          }
        },
        {
          align: 'right',
          dataIndex: 'size',
          slots: { title: 'sizeTitle', customRender: 'size' },
          width: 100,
          sorter: (a, b) => {
            return a.size < b.size ? 1 : -1
          }
        },
        {
          align: 'right',
          dataIndex: 'updated_at',
          slots: { title: 'timeTitle', customRender: 'time' },
          width: 220,
          sorter: (a, b) => {
            return a.updated_at < b.updated_at ? 1 : -1
          }
        }
      ],
      // 文件列表加载动画
      file_list_loading: false,
      dplayer: null,
      // 面包屑导航路由
      routes: []
    }
  },
  methods: {
    // 初始化
    init() {
      this.updateHeadNav()
      // 销毁播放器
      if (this.dplayer) {
        this.dplayer.destroy()
      }
      // 设置标题
      let title = 'ShareList'
      if (this.data.subtitle) {
        title = this.data.subtitle
        if (this.data.title) {
          title += ` - ${this.data.title}`
        }
      } else {
        title = this.data.title
      }
      document.title = title
    },
    // 获取文件列表
    updateFileList() {
      this.file_list_loading = true
      let path = this.$route.fullPath
      if (path == undefined) {
        path = ''
      }
      getList(path)
        .then(res => {
          let el = document.createElement('div')
          el.innerHTML = res.data
          let data = JSON.parse(
            el.getElementsByTagName('script')[0].innerHTML.substr(9)
          ) // var data=
          this.data = data
          this.init()
          if (data.page == 'list') {
            data.list = data.list.map(item => {
              item.size = byte(item._size)
              if (item.size == '0 B') {
                item.size = ''
              }
              return item
            })
          } else if (data.page == 'detail') {
            // 预览视频
            if (data.type == 'video') {
              this.dplayer = new DPlayer({
                container: document.getElementById('video-preview'),
                video: {
                  url: data.url,
                  type: 'auto'
                },
                autoplay: true
              })
            }
          }
          this.file_list_loading = false
        })
        .catch(res => {
          console.log(res)
          message.error('加载错误：' + res)
          this.file_list_loading = false
        })
    },
    // 加载面包屑导航
    updateHeadNav() {
      const paths = location.pathname.substr(1).split('/')
      let routes = [
        {
          path: '/',
          breadcrumbName: this.data.title
        }
      ]
      paths.map(val => {
        if (val == '') {
          return false
        }
        routes.push({
          path: routes[routes.length - 1].path + `${val}/`,
          breadcrumbName: decodeURIComponent(val)
        })
      })
      this.routes = routes
    },
    // 设置表格行属性
    customRow(record) {
      return {
        // 点击行
        onClick: () => {
          if (
            record.type == 'folder' ||
            Object.prototype.hasOwnProperty.call(
              queryURLparams(record.href),
              'preview'
            )
          ) {
            this.$router.push(record.href)
          } else {
            window.open(record.href, '_blank')
          }
        }
      }
    }
  },
  // 挂载页面
  mounted() {
    if (!Object.keys(this.data).length) {
      this.$router.push('/404')
    }
    this.init()
  }
}
</script>

<style scoped lang="less">
@import url('https://cdn.bootcss.com/github-markdown-css/4.0.0/github-markdown.min.css');
.layout {
  background: #fff;
}
.warp {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 15px;
}
// 面包屑导航
.head-nav {
  position: relative;
  background: #f5f6fa;
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
.file-list {
  cursor: pointer;
  svg {
    vertical-align: top;
    width: 21px;
    height: 21px;
    margin-right: 2px;
  }
  .warp {
    padding: 0;
  }
  .table-title {
    font-size: 16px;
    font-weight: bold;
  }
  ::v-deep(.ant-table-body) {
    td {
      border-bottom: none;
    }
    tr:hover td {
      background: #f7f7f7;
    }
    th {
      background-color: transparent;
    }
    tr th:hover,
    .ant-table-column-sorters:hover::before {
      background: transparent;
    }
  }
}
.readme {
  margin-top: 20px;
  ::v-deep(.ant-card-head-title) {
    font-weight: bold;
  }
}
// 预览页面
.preview {
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  height: 100%;
  padding-top: 56px;
  text-align: center;
  #video-preview {
    height: 100%;
  }
}
footer {
  background: #fff;
  padding: 0;
  margin-top: 20px;
  border-top: 1px solid #eee;
  height: 40px;
  line-height: 40px;
  color: #8c8c8c;
  .warp {
    display: flex;
    a {
      color: inherit;
    }
    p:first-child {
      flex: 1;
    }
  }
}
@media (max-width: 576px) {
  .file-list {
    ::v-deep(.ant-table-body) {
      th:last-child,
      td:last-child {
        display: none;
      }
    }
  }
}
</style>

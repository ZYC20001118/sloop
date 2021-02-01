<template>
  <a-layout id="components-layout-demo-top" class="layout">
    <a-layout-content>
      <!-- 面包屑导航 -->
      <div class="head-nav">
        <head-nav class="warp" ref="refHeadNav" :data="data" />
      </div>
      <!-- 文件列表 -->
      <div v-if="data.page == 'list'" class="file-list">
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
              <use :xlink:href="'#icon-' + record.type"></use></svg
            >{{ text }}
          </template>
          <template #size="{ text }">{{ text || '-' }}</template>
          <template #time="{ text }">{{ parseDate2Str(text) || '-' }}</template>
        </a-table>
      </div>
      <!-- 预览页面 -->
      <div v-show="data.page == 'detail'" class="preview">
        <!-- 视频预览 -->
        <div v-show="data.type == 'video'" id="video-preview"></div>
        <div v-if="data.type != 'video'" class="warp">
          <!-- 图片预览 -->
          <img v-if="data.type == 'image'" :src="data.url" />
          <!-- 音频预览 -->
          <audio v-if="data.type == 'audio'" :src="data.url" controls autoplay />
        </div>
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
        <p>
          Powered by <a href="https://github.com/reruin/sharelist/" target="_blank">sharelist</a> |
          Theme by sloop
          <br />
          构建时间: {{ updateTime }}
        </p>
        <p><a href="/manage" target="_blank">管理</a></p>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import HeadNav from '../components/HeadNav.vue'

import { getList } from '../utils/api'
import { queryURLparams, JsonParse } from '../utils/base'
import { byte } from '../utils/format'

import { CancelToken } from 'axios'
import DPlayer from 'dplayer'
import { useRoute, useRouter } from 'vue-router'
import { reactive, watch, toRefs, ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

export default {
  components: {
    HeadNav
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const data = reactive({
      // 主要数据
      data: typeof window.data == 'undefined' ? [] : window.data,
      // 自定义表格
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
            return a._size < b._size ? 1 : -1
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
      // 播放器
      dplayer: null,
      updateTime: process.env.VUE_APP_UPDATE_TIME
    })
    /**
     * 渲染页面
     */
    const renderPage = () => {
      console.log('====renderPage====渲染页面====')
      // 销毁播放器
      if (data.dplayer) {
        data.dplayer.destroy()
      }
      // 设置标题
      let title = data.data.title || 'ShareList'
      if (data.data.subtitle) {
        title = `${data.data.subtitle} - ${title}`
      }
      document.title = title
      if (data.data.page == 'list') {
        data.data.list = data.data.list.map(item => {
          item.size = byte(item._size)
          if (item.size == '0 B') {
            item.size = ''
          }
          return item
        })
      } else if (data.data.page == 'detail') {
        // 预览视频
        if (data.data.type == 'video') {
          data.dplayer = new DPlayer({
            container: document.getElementById('video-preview'),
            video: {
              url: data.data.url,
              type: 'auto'
            },
            autoplay: true
          })
        }
      }
    }
    /**
     * 更新文件列表
     */
    const updateFileList = () => {
      console.log('====updateFileList====更新文件列表====')
      data.file_list_loading = true
      let path = route.fullPath
      if (path == undefined) {
        path = ''
      }
      // 取消上一次的请求
      if (data.cancel) {
        data.cancel('取消请求')
      }
      getList(
        path,
        {},
        new CancelToken(c => {
          // executor 函数接收一个 cancel 函数作为参数
          data.cancel = c
        })
      )
        .then(res => {
          let div = document.createElement('div')
          div.innerHTML = res.data
          let script = div.getElementsByTagName('script')
          let back = true
          if (script.length) {
            let json = script[0].innerHTML.substr(9)
            json = JsonParse(json)
            if (json != false) {
              data.data = json // var data=
              renderPage()
              back = false
            }
          }
          if (back) {
            router.back()
          }
          data.file_list_loading = false
          console.log(res)
        })
        .catch(res => {
          console.log(res.response)
          data.file_list_loading = false
          // router.back() // 有BUG
        })
    }
    // 表格属性
    const customRow = record => {
      return {
        // 点击行
        onClick: () => {
          if (
            record.type == 'folder' ||
            record.type == 'level-up' ||
            Object.prototype.hasOwnProperty.call(queryURLparams(record.href), 'preview')
          ) {
            router.push(record.href)
          } else {
            window.open(record.href, '_blank')
          }
        },
        onMouseDown: event => {
          if (event.button == 1) {
            window.open(record.href, '_blank')
          }
        }
      }
    }
    /**
     * 时间格式化
     */
    dayjs.extend(customParseFormat)
    const parseDate2Str = time => {
      if (dayjs(time).isValid() && !dayjs(time, 'YYYY-MM-DD', true).isValid()) {
        time = dayjs(time).format('YYYY-M-D HH:mm:ss')
      }
      return time || '-'
    }
    /**
     * 头部导航更新
     */
    const refHeadNav = ref(null)
    const updateHeadNav = () => {
      refHeadNav.value.init()
    }
    watch(
      () => route.path,
      () => {
        if (['Home', 'Index'].includes(route.name)) {
          updateHeadNav()
          updateFileList()
        }
      }
    )
    onMounted(() => {
      renderPage()
      if (process.env.NODE_ENV === 'development') {
        updateHeadNav()
        updateFileList()
      }
    })
    // 404 跳转
    if (data.data.length == 0 && process.env.NODE_ENV !== 'development') {
      router.push('/404')
    }
    return {
      ...toRefs(data),
      customRow,
      refHeadNav,
      parseDate2Str
    }
  }
}
</script>

<style scoped lang="less">
@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css');
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
  background: #f5f6fa;
}
.file-list {
  cursor: pointer;
  svg {
    vertical-align: middle;
    width: 22px;
    height: 22px;
    margin-right: 6px;
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
  .warp {
    padding: 15px;
    img {
      max-width: 100%;
    }
  }
  #video-preview {
    height: 100%;
  }
}
footer {
  background: #fff;
  padding: 0;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 10px;
  color: #8c8c8c;
  .warp {
    display: flex;
    a {
      color: inherit;
      &:hover {
        color: #222;
      }
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

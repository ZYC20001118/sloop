<template>
  <a-layout id="components-layout-demo-top" class="layout">
    <a-layout-content>
      <!-- 面包屑导航 -->
      <div class="head-nav">
        <head-nav class="warp" :data="data" />
      </div>
      <!-- 文件列表 -->
      <div v-if="data.page == 'list'" class="file-list">
        <a-table
          class="warp"
          :columns="columns"
          :customRow="customRow"
          :data-source="data.list"
          :pagination="false"
          :loading="listLoading"
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
              <use :xlink:href="`#icon-${record.type}`"></use></svg
            >{{ text }}
          </template>
          <template #size="{ text }">{{ text || '-' }}</template>
          <template #time="{ text }">{{ parseDate2Str(text) || '-' }}</template>
        </a-table>
      </div>
      <!-- 预览页面 -->
      <preview v-if="data.page == 'detail'" :data="data" :loading="listLoading" />
      <!-- 授权页面 -->
      <auth v-if="data.page == 'auth'" :data="data" :loading="listLoading" @updateFileList="updateFileList" />
      <!-- 自定义页面 -->
      <custom v-if="data.page == 'custom'" :data="data" :loading="listLoading" />
      <!-- 自诉文件 -->
      <div v-if="data.readme" class="readme warp">
        <a-card title="README.md">
          <article class="markdown-body" v-html="data.readme"></article>
        </a-card>
      </div>
    </a-layout-content>
    <!-- 页脚 -->
    <a-layout-footer v-if="data.page != 'detail'">
      <a-row class="warp" type="flex">
        <a-col :flex="1">
          Powered by <a href="https://github.com/reruin/sharelist" target="_blank">sharelist</a> | Theme by
          <a href="https://github.com/liumingye/sloop" target="_blank">sloop</a>
          <br />
          构建时间: {{ updateTime }}
        </a-col>
        <a-col>
          <a href="/manage" target="_blank">管理</a>
        </a-col>
      </a-row>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import HeadNav from '@/components/HeadNav'
import Preview from '@/components/Preview'
import Custom from '@/components/Custom'
import Auth from '@/components/Auth'

import { getList } from '@/utils/api'
import { queryURLparams, JsonParse } from '@/utils/base'
import { byte } from '@/utils/format'

import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { CancelToken } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { reactive, watch, toRefs, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { message } from 'ant-design-vue'

export default {
  components: {
    HeadNav,
    Preview,
    Custom,
    Auth,
    UserOutlined,
    LockOutlined
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
          ellipsis: true,
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
      listLoading: false,
      // 是否跳过加载数据
      skipLoad: false,
      updateTime: process.env.VUE_APP_UPDATE_TIME
    })
    /**
     * 渲染页面
     */
    const renderPage = json => {
      console.log('====renderPage====渲染页面====')
      let _data = json || data.data
      // 列表最前加入..文件夹
      if (_data.parent) {
        _data.list.unshift({
          href: _data.parent,
          type: 'level-up',
          _size: 0,
          updated_at: '',
          name: '..'
        })
      }
      // 设置标题
      let title = _data.title || 'ShareList'
      if (_data.subtitle) {
        title = `${_data.subtitle} - ${title}`
      }
      document.title = title
      if (_data.page == 'list') {
        _data.list = _data.list.map(item => {
          item.size = byte(item._size)
          if (item.size == '0 B') {
            item.size = ''
          }
          return item
        })
      }
      data.data = _data
    }
    /**
     * 更新文件列表
     */
    const updateFileList = () => {
      console.log('====updateFileList====更新文件列表====')
      data.listLoading = true
      const path = route.fullPath
      if (data.cancel) {
        data.cancel('取消请求') // 取消上一次的请求
      }
      getList(
        path,
        {},
        new CancelToken(c => {
          data.cancel = c // executor 函数接收一个 cancel 函数作为参数
        })
      )
        .then(res => {
          const div = document.createElement('div') // 解析html
          div.innerHTML = res.data
          const script = div.getElementsByTagName('script')
          let back = true // 是否返回
          if (script.length) {
            const json = JsonParse(script[0].innerHTML.substr(9)) // 去掉前面的 var data=
            if (json != false) {
              renderPage(json) // 渲染页面
              back = false
            }
          }
          if (back && window.history.length > 1) {
            router.back()
          }
          data.listLoading = false
        })
        .catch(res => {
          console.error(res)
          if (res.response && res.response.status == 404) {
            router.replace({ name: 'ErrorPage404' })
          } else if (!res.__CANCEL__) {
            data.listLoading = false
            data.skipLoad = true
            if (window.history.length > 1) {
              router.back()
            }
          }
        })
    }
    /**
     * 表格属性
     */
    const customRow = ({ type, href }) => {
      return {
        // 点击事件
        onClick: () => {
          if (['level-up', 'folder'].includes(type) || 'preview' in queryURLparams(href)) {
            router.push(href)
          } else {
            window.open(href, '_blank')
          }
        },
        onMouseDown: event => {
          // 鼠标中键 新窗打开
          if (event.button == 1) {
            window.open(href, '_blank')
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
    watch(
      () => route.path,
      () => {
        if (!data.skipLoad && route.name == 'Index') {
          updateFileList()
        }
        data.skipLoad = false
      }
    )
    onMounted(() => {
      renderPage()
      if (process.env.NODE_ENV === 'development') {
        updateFileList()
      }
    })
    // 404 跳转
    if (data.data.length == 0 && process.env.NODE_ENV !== 'development') {
      router.replace({ name: 'ErrorPage404' })
    }
    return {
      ...toRefs(data),
      customRow,
      parseDate2Str,
      updateFileList
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
footer {
  background: #fff;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding: 10px 0;
  color: #8c8c8c;
  .warp {
    a {
      color: inherit;
      &:hover {
        color: #222;
      }
    }
  }
}
@media (max-width: 576px) {
  .file-list {
    ::v-deep(.ant-table-body) {
      colgroup {
        col:nth-child(3) {
          display: none;
        }
      }
      th:nth-child(3),
      td:nth-child(3) {
        display: none;
      }
    }
  }
}
</style>

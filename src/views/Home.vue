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
      <a-spin v-show="data.page == 'detail'" wrapperClassName="preview-spin" :spinning="file_list_loading">
        <div class="preview">
          <!-- 视频预览 -->
          <div v-show="['video', 'hls'].includes(data.type)" id="video-preview"></div>
          <div v-if="!['video', 'hls'].includes(data.type)" class="warp">
            <!-- 图片预览 -->
            <a-image v-if="data.type == 'image'" :src="data.url" />
            <!-- 音频预览 -->
            <audio v-if="data.type == 'audio'" :src="data.url" controls autoplay />
          </div>
        </div>
      </a-spin>
      <!-- 授权页面 -->
      <a-spin v-if="data.page == 'auth'" :spinning="file_list_loading">
        <div class="auth warp" style="max-width:320px">
          <a-form layout="vertical" :rules="authRules" :model="auth">
            <a-form-item>
              <h2>文档</h2>
            </a-form-item>
            <a-form-item name="user">
              <a-input v-model:value="auth.user" :disabled="authLoading" placeholder="请输入访问账号" size="large">
                <template #prefix><user-outlined /></template>
              </a-input>
            </a-form-item>
            <a-form-item name="pass">
              <a-input-password v-model:value="auth.pass" :disabled="authLoading" placeholder="请输入访问密码" size="large">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>
            <a-form-item>
              <a-button @click="authSubmit" :loading="authLoading" html-type="submit" size="large" type="primary" block>确定</a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
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
          Powered by <a href="https://github.com/reruin/sharelist/" target="_blank">sharelist</a> | Theme by sloop
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
import HeadNav from '../components/HeadNav.vue'

import { getList, auth } from '../utils/api'
import { queryURLparams, JsonParse } from '../utils/base'
import { byte } from '../utils/format'

import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { CancelToken } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { reactive, watch, toRefs, onMounted } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { message } from 'ant-design-vue'

export default {
  components: {
    HeadNav,
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
      file_list_loading: false,
      // 播放器
      dplayer: null,
      // 是否跳过加载数据
      skipLoad: false,
      // 授权页面
      auth: {
        user: '',
        pass: ''
      },
      authRules: {
        user: [{ required: true, message: '', trigger: 'blur' }],
        pass: [{ required: true, message: '', trigger: 'blur' }]
      },
      authLoading: false,
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
      // 列表最前加入..文件夹
      if (data.data.parent) {
        data.data.list.unshift({
          href: data.data.parent,
          type: 'level-up',
          _size: 0,
          updated_at: '',
          name: '..'
        })
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
        if (['video', 'hls'].includes(data.data.type)) {
          var type = 'auto'
          if (data.data.type == 'hls') {
            type = 'hls'
          }
          data.dplayer = new window.DPlayer({
            container: document.getElementById('video-preview'),
            video: {
              url: data.data.url,
              type: type
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
          let div = document.createElement('div') // 解析html
          div.innerHTML = res.data
          let script = div.getElementsByTagName('script')
          let back = true // 是否返回
          if (script.length) {
            let json = script[0].innerHTML.substr(9) // 去掉前面的 var data=
            json = JsonParse(json)
            if (json != false) {
              if (['custom'].includes(json.page)) {
                window.open(route.fullPath, '_blank') // 自定义页面新窗打开
              } else {
                data.data = json
                renderPage() // 渲染页面
                back = false
              }
            }
          }
          if (back) {
            router.back()
          }
          data.file_list_loading = false
        })
        .catch(res => {
          console.error(res)
          if (res.response.status == 404) {
            router.push('/404?i=-2')
          } else {
            data.file_list_loading = false
            data.skipLoad = true
            router.back()
          }
        })
    }
    /**
     * 表格属性
     */
    const customRow = record => {
      return {
        // 点击行
        onClick: () => {
          if (record.type == 'folder' || record.type == 'level-up' || Object.prototype.hasOwnProperty.call(queryURLparams(record.href), 'preview')) {
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
     * 授权页面提交
     */
    const authSubmit = () => {
      data.authLoading = true
      if (data.cancel) {
        data.cancel('取消请求') // 取消上一次的请求
      }
      auth(
        {
          user: data.auth.user,
          pass: data.auth.pass
        },
        new CancelToken(c => {
          data.cancel = c // executor 函数接收一个 cancel 函数作为参数
        })
      )
        .then(res => {
          var resd = res.data
          console.log(resd)
          if (resd.status == 0) {
            updateFileList()
          } else {
            message.error(resd.message)
            data.authLoading = false
          }
        })
        .catch(res => {
          console.error(res)
          data.authLoading = false
        })
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
      router.push('/404')
    }
    return {
      ...toRefs(data),
      customRow,
      parseDate2Str,
      authSubmit
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
.preview-spin {
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  height: 100%;
  padding-top: 56px;
  ::v-deep(.ant-spin-container) {
    height: 100%;
    width: 100%;
    .preview {
      width: 100%;
      height: 100%;
      .warp {
        padding: 15px;
        text-align: center;
        img {
          max-width: 100%;
        }
        audio {
          width: 100%;
          outline: none;
        }
      }
      #video-preview {
        height: 100%;
      }
    }
  }
}
.auth {
  margin: 10% auto;
  ::deep(.ant-form-item) {
    padding-bottom: 0;
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

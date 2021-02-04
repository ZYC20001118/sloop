<template>
  <a-spin wrapperClassName="preview-spin" :spinning="spinLoading">
    <div class="preview">
      <!-- 视频预览 -->
      <div v-if="data.type == 'video'" id="video-preview"></div>
      <div v-else class="warp">
        <!-- 文本预览 -->
        <div v-if="['txt', 'md'].includes(data.ext)" v-html="data.body"></div>
        <!-- 图片预览 -->
        <a-image v-else-if="data.type == 'image'" :src="data.url" />
        <!-- 音频预览 -->
        <audio v-else-if="data.type == 'audio'" :src="data.url" controls autoplay />
        <!-- 文档预览 -->
        <iframe v-else-if="['word', 'doc', 'pdf'].includes(data.type)" frameborder="0" :src="data.purl"></iframe>
      </div>
    </div>
  </a-spin>
</template>

<script>
import { reactive, toRefs, ref, onMounted, watchEffect } from 'vue'

export default {
  name: 'Auth',
  props: {
    data: Object,
    loading: Boolean
  },
  setup(props) {
    const data = reactive({
      data: props.data,
      spinLoading: props.loading
    })
    // 监听变化
    watchEffect(() => {
      data.spinLoading = props.loading
    })
    onMounted(() => {
      const _data = data.data
      if (_data.type == 'video' || _data.ext == 'hls') {
        let type = 'auto'
        if (_data.ext == 'hls') {
          type = 'hls'
        }
        new window.DPlayer({
          container: document.getElementById('video-preview'),
          video: {
            url: _data.url,
            type: type
          },
          autoplay: true
        })
      } else if (['word', 'doc'].includes(_data.type)) {
        _data.purl = `https://view.officeapps.live.com/op/view.aspx?src=${location.origin}${location.pathname}` // src里不能带&，只能用直连302代替
      } else if (['pdf'].includes(_data.type)) {
        _data.purl = `http://liumingye.gitee.io/pdf/?file=${encodeURIComponent(`${location.origin}${location.pathname}?preview=1&proxy=1`)}`
      }
      data.data = _data
    })
    return {
      ...toRefs(data)
    }
  }
}
</script>

<style scoped lang="less">
// 预览页面
.preview-spin {
  position: static;
  ::v-deep(.ant-spin-container) {
    position: static;
    .preview {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding-top: 56px;
      .warp {
        width: 100%;
        max-width: 980px;
        margin: 0 auto;
        padding: 15px;
        text-align: center;
        height: 100%;
        iframe {
          height: 100%;
          width: 100%;
          background: #f5f5f5;
        }
        img {
          max-width: 100%;
        }
        audio {
          width: 100%;
          outline: none;
        }
        .markdown-body {
          padding: 0 0 16px !important;
        }
      }
      #video-preview {
        height: 100%;
      }
    }
  }
}
</style>

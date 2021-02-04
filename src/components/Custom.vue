<template>
  <a-spin :spinning="spinLoading">
    <div class="custom">
      <div class="body" v-html="decodeURI(data.body)"></div>
    </div>
  </a-spin>
</template>

<script>
import { reactive, toRefs, watchEffect } from 'vue'

export default {
  name: 'Custom',
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
    return {
      ...toRefs(data)
    }
  }
}
</script>

<style scoped lang="less">
.custom {
  display: block;
  padding: 0 15px;
  max-width: 350px;
  margin: 10% auto;
  ::v-deep(.body) {
    // 挂载向导 样式
    .auth {
      width: 100%;
    }
    h3 {
      font-size: 16px;
      color: #666;
      margin: 2em 0;
    }
    .sl-input {
      display: block;
      width: 100%;
      height: 44px;
      padding: 11px 16px;
      font-size: 14px;
      line-height: 1.5;
      color: #404040;
      background: #fff;
      border: 2px solid #f1f3f5;
      transition: border-color ease-in-out 0.15s;
      -webkit-appearance: none;
      margin: 15px 0;
      &:hover {
        border-color: #1e88e5;
      }
    }
    .sl-button {
      color: #fff;
      background-color: #1e88e5;
      border-color: #1e88e5;
      width: 100%;
      margin-bottom: 0;
      text-align: center;
      cursor: pointer;
      background-image: none;
      border: 1px solid transparent;
      white-space: nowrap;
      line-height: 1.15;
      padding: 12px 20px;
      font-size: 14px;
      border-radius: 4px;
      user-select: none;
      position: relative;
      &:hover {
        background-color: rgba(30, 136, 229, 0.85);
        border-color: rgba(30, 136, 229, 0.85);
      }
      &:focus {
        color: #fff;
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
      }
    }
  }
}
</style>

<template>
  <a-spin :spinning="spinLoading">
    <div class="auth">
      <a-form layout="vertical" ref="authForm" :rules="rules" :model="auth">
        <a-form-item>
          <h2>{{ data.name }}</h2>
        </a-form-item>
        <a-form-item name="user">
          <a-input v-model:value="auth.user" :disabled="disabled" placeholder="请输入访问账号" size="large" autofocus>
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="pass">
          <a-input-password v-model:value="auth.pass" :disabled="disabled" placeholder="请输入访问密码" size="large">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button @click="authSubmit" :loading="disabled" html-type="submit" size="large" type="primary" block>确定</a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-spin>
</template>

<script>
import { auth } from '@/utils/api'

import { reactive, toRefs, ref, onMounted, watchEffect } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { CancelToken } from 'axios'

export default {
  name: 'Auth',
  components: {
    UserOutlined,
    LockOutlined
  },
  props: {
    data: Object,
    loading: Boolean
  },
  setup(props, context) {
    const parent = { ...context }
    const data = reactive({
      data: props.data,
      auth: {
        user: '',
        pass: ''
      },
      rules: {
        user: [{ required: true, message: '', trigger: 'blur' }],
        pass: [{ required: true, message: '', trigger: 'blur' }]
      },
      disabled: false,
      spinLoading: props.loading
    })
    // 监听变化
    watchEffect(() => {
      data.spinLoading = props.loading
    })
    const authForm = ref(0)
    const authSubmit = () => {
      console.log(data)
      authForm.value
        .validate()
        .then(() => {
          data.disabled = true
          if (data.cancel) {
            data.cancel('取消请求')
          }
          auth(
            {
              user: data.auth.user,
              pass: data.auth.pass
            },
            new CancelToken(c => {
              data.cancel = c
            })
          )
            .then(res => {
              const r = res.data
              if (r.status == 0) {
                message.success(r.message)
                parent.emit('updateFileList')
              } else {
                message.error(r.message)
                data.disabled = false
              }
            })
            .catch(err => {
              console.error(err)
              data.disabled = false
            })
        })
        .catch(err => {
          console.error(err)
          if (data.auth.user == '' || data.auth.pass == '') {
            message.info('请填写账号密码')
          } else {
            message.error('未知错误')
          }
          data.disabled = false
        })
    }
    onMounted(() => {
      data.auth.user = data.auth.pass = ''
      data.disabled = false
    })
    return {
      ...toRefs(data),
      authForm,
      authSubmit
    }
  }
}
</script>

<style scoped lang="less">
.auth {
  padding: 0 15px;
  max-width: 350px;
  margin: 10% auto;
  ::v-deep(.ant-form-item) {
    margin-bottom: 10px;
  }
}
</style>

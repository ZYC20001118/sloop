// 引入axios
import axios from 'axios'
// 引入message，提示错误
import { message } from 'ant-design-vue'

// 响应拦截器即异常处理
axios.interceptors.response.use(
  response => {
    return response
  },
  // 处理响应失败
  err => {
    message.error(`${err}`)
    return Promise.reject(err) // 返回接口返回的错误信息
  }
)

axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? '/api' : '/'
axios.defaults.timeout = 30000

export default {
  // get请求
  get(param) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        ...param
      })
        .then(res => {
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
    })
  }, // 上传文件
  uploadFileRequest(param) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        ...param,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(res => {
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
    })
  }, // post请求
  post(param) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        ...param
      })
        .then(res => {
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

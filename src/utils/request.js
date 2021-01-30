import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://ubuntu:33001/',
  // baseURL: '/',
  // withCredentials: false,
  // crossdomain: true,
  timeout: 30000
})

//请求拦截
instance.interceptors.request.use(req => {
  return req
})

export default instance

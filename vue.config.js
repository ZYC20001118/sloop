const port = process.env.port || process.env.npm_config_port || 33002 // dev port

process.env.VUE_APP_TITLE = 'ShareList'
const dayjs = require('dayjs')
const time = dayjs().format('YYYY-M-D HH:mm:ss')
process.env.VUE_APP_UPDATE_TIME = time
process.env.VUE_APP_VERSION = '0.1'

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  lintOnSave: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 前端配置代理访问后端
    proxy: {
      ['/api']: {
        target: 'http://ubuntu:33001',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          ['^/api']: ''
        }
      }
    }
  },
  productionSourceMap: false,
  chainWebpack(config) {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
    // 移除 preload 插件
    config.plugins.delete('preload')
    config.optimization.runtimeChunk('single')
  }
}

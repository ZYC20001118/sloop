const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const port = process.env.port || process.env.npm_config_port || 9528 // dev port

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
    }
  },
  productionSourceMap: false,
  chainWebpack(config) {
    config.when(process.env.NODE_ENV === 'development', config => config.devtool('cheap-source-map'))
    config.optimization.splitChunks({
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          priority: 10
        },
        antDesignVue: {
          name: 'chunk-ant-design-vue',
          test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
          priority: 20
        },
        commons: {
          name: 'chunk-commons',
          test: resolve('src/components'),
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    })
    config.optimization.runtimeChunk('single')
  }
}

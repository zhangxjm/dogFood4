const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    '@dcloudio/uni-app'
  ],
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    disableHostCheck: true
  }
})

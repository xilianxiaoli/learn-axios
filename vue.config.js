module.exports = {
    devServer: {
        proxy: {
            '/mock':{
                target:'http://127.0.0.1:3000'
            }
        }
      }
}
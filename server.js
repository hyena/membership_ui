const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const path = require('path')

const config = require('./webpack.config')

new WebpackDevServer(
  webpack(config),
  {
    publicPath: config.output.publicPath,
    contentBase: path.resolve(__dirname, 'src'),
    hot: true,
    progress: true,
    historyApiFallback: true,
    stats: {
      colors: true
    }
  }
)
  .listen(
    config.devServer.port,
    'localhost',
    (err, result) => {
      if (err) {
        return console.log(err)
      }
      console.log(`Listening at http://localhost:${config.devServer.port}`)
    }
  )

const webpack = require('webpack')
const DashboardPlugin = require('webpack-dashboard/plugin')
const path = require('path')

const DEV_SERVER_PORT = 3000
require('dotenv').config({
  path: process.env.DOTENV_CONFIG || '.env'
})

module.exports = {
  devtool: '#cheap-module-source-map',
  entry: [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`,
    'webpack/hot/only-dev-server',
    'babel-polyfill',
    './src/js/index.jsx'
  ],
  devServer: {
    port: DEV_SERVER_PORT
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(scss|css)$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.js[x]?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loaders: ['babel']
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin(),
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'USE_AUTH',
      'MEMBERSHIP_API_URL',
      'AUTH0_CLIENT_ID',
      'AUTH0_DOMAIN',
      'DEV_SERVER_PORT'
    ]),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}

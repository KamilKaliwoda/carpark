const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/ant-carpark-web.tsx',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
    new EnvironmentPlugin({
      API_PORT: process.env.SERVER_PORT,
      API_IP: process.env.DB_SERVER
    }),
  ],
};

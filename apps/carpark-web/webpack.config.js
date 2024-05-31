const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join, resolve } = require('path');
const { EnvironmentPlugin } = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/carpark-web'),
  },
  devServer: {
    port: 8131,
    hot: true,
    liveReload: true,
    host: "127.0.0.1",
    webSocketServer: false,
    allowedHosts: ['carpark.site', 'www.carpark.site'],
    compress: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // Injects CSS into the DOM
          'css-loader' // Resolves CSS imports
        ]
      },
      // Other rules for processing JavaScript, TypeScript, etc.
    ]
  },
  plugins: [
    new NxWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/ant-carpark-web.tsx',
      index: './src/index.html',
      baseHref: '/',
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    new EnvironmentPlugin({
      API_PORT: process.env.SERVER_PORT,
      API_IP: process.env.DB_SERVER
    }),
  ],
};

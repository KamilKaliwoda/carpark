const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');
const { EnvironmentPlugin } = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/carpark-web'),
  },
  devServer: {
    port: 8080,
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

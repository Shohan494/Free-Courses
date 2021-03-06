const webpack = require('webpack');
const path = require('path');
const loaders = require('./webpack.loaders');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const PUBLIC_PATH = 'https://freecourses.github.io/';
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const snakeCase = require('lodash.snakecase');

const paths = [];
const courses = require('./src/data/courses.json');
const categories = require('./src/data/categories.json');

courses.forEach(course => {
  paths.push('/course/' + snakeCase(course.title + course.author));
});

categories.forEach(category => {
  paths.push('/category/' + category.title);
});

loaders.push({
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded' }),
  exclude: ['node_modules']
});

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    publicPath: './',
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new SitemapPlugin('https://freecourses.github.io/#/', paths),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './src/template.html',
      favicon: './src/img/favicon.ico',
      files: {
        css: ['style.css'],
        js: ['bundle.js'],
      }
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js'),
    }),
    new SWPrecacheWebpackPlugin(
      {
        cacheId: 'freecourses-cache-id',
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: 'sw.js',
        minify: true,
        navigateFallback: PUBLIC_PATH + 'index.html',
        staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/]
      }),
    new WebpackPwaManifest({
      filename: "manifest.json",
      name: 'FreeCourses',
      short_name: 'FreeCourses',
      description: 'This is a list of free courses about programming.',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      'theme-color': '#ffffff',
      start_url: '/',
      publicPath: PUBLIC_PATH,
      ios: {
        'apple-mobile-web-app-title': 'FreeCourses',
        'apple-mobile-web-app-status-bar-style': 'black'
      },
      icons: [
        {
          src: path.resolve('src/img/book.png'),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: path.join('assets', 'icons')
        },
        {
          src: path.resolve('src/img/book.png'),
          sizes: [120, 152, 167, 180, 1024],
          destination: path.join('icons', 'ios'),
          ios: true
        },
        {
          src: path.resolve('src/img/book.png'),
          size: 1024,
          destination: path.join('icons', 'ios'),
          ios: 'startup'
        },
        {
          src: path.resolve('src/img/book.png'),
          sizes: [36, 48, 72, 96, 144, 192, 512],
          destination: path.join('icons', 'android')
        }
      ]
    })
  ]
};

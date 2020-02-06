'use strict';

const webpack = require('webpack'); // eslint-disable-line
const config = require('./task/config');
const path = require('path');
const glob = require('glob');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const isProduction = process.env.NODE_ENV === 'production';

// エントリーファイルをディレクトリ構成ごと取得
const entry = {};

// JSの対象
const jsFiles = glob.sync(`${config.path.src.scripts.view}**/*.js`);
for (const file of jsFiles) {
  const key = file.replace(config.path.src.root, '').split('.js')[0];
  entry[key] = file;
}

// CSSの対象
const cssFiles = glob.sync(`${config.path.src.styles.view}**/*.+(sass|scss|css)`, { ignore: [`${config.path.src.styles.view}**/_*.+(sass|scss|css)`] });
for (const file of cssFiles) {
  const key = file.replace(config.path.src.root, '').split(/\.(sass|scss|css)/)[0];
  entry[key] = file;
}

module.exports = {
  mode,
  devtool: !isProduction ? 'source-map' : false,
  entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@img': path.resolve(__dirname, 'src/img')
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // CSS内のurl()メソッドの取り込みを禁止する
              url: true,
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              // PostCSS側でもソースマップを有効にする
              sourceMap: true,
              plugins: [
                // ベンダープレフィックスを追加する(gridも有効)
                require('autoprefixer')({ grid: true })
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
        terserOptions: {
          compress: {
            cache: true,
            drop_console: true
          }
        }
      })
    ]
  },
  plugins: [
    // distを削除
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, config.path.dist.root)]
    }),
    // ファイルコピー
    new CopyPlugin([
      {
        from: `${config.path.src.img}`,
        to: 'img'
      },
      {
        from: `${config.path.src.html}`,
        to: 'html'
      }
    ]),
    new OptimizeCSSAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: ['default',
          {
            autoprefixer: {
              // autoprefixerによる vendor prefix の追加を行う
              add: true,
              // サポートするブラウザVersionの指定
              browsers: [
                'last 2 versions',
                'ie >= 11',
                'Android >= 4'
              ]
            },
            // ライセンスも含めて、コメントを全て削除する
            discardComments: { removeAll: true },
            // CSSの定義のソートを行う
            cssDeclarationSorter: { order: 'smacss' }
          }
        ]
      },
      canPrint: true
    }),
    // CSSファイルの出力
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }),
    // Stylelint
    new StylelintPlugin({
      files: [
        `${config.path.src.styles.lib}**/*`,
        `${config.path.src.styles.view}**/*`
      ],
      syntax: 'scss'
    })
  ]
};

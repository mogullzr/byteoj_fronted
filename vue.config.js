const { defineConfig } = require("@vue/cli-service");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = defineConfig({
  configureWebpack: (config) => {
    if (isProduction) {
      // 进行代码混淆
      // 添加 Gzip 压缩插件
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: /\.js$|\.html$|\.json$|\.css/,
          threshold: 10240,
          minRatio: 0.8,
        }),
        // 提取 CSS 插件
        new MiniCssExtractPlugin({
          filename: "css/[name].[contenthash].css", // 提取 CSS 的文件名
          chunkFilename: "css/[id].[contenthash].css",
        })
      );

      // 性能提示配置
      config.performance = {
        hints: "warning",
        maxEntrypointSize: 50000000,
        maxAssetSize: 30000000,
        assetFilter: function (assetFilename) {
          return assetFilename.endsWith(".js");
        },
      };
    }

    // 确保将 MiniCssExtractPlugin 的处理方式加入到 webpack 配置中
    if (!config.module) {
      config.module = { rules: [] }; // 初始化 rules
    }

    const cssRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test(".css")
    );

    if (!cssRule) {
      config.module.rules.push({
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      });
    }
  },
  // 进行代码混淆
  chainWebpack: (config) => {
    config.optimization.minimizer("terser").tap((args) => {
      args[0] = {
        ...args[0],
        terserOptions: {
          compress: {
            drop_console: true, // 删除所有的 `console` 语句
            drop_debugger: true, // 删除所有的 `debugger` 语句
          },
          mangle: true, // 混淆变量名
          output: {
            comments: true, // 删除所有的注释
          },
        },
        extractComments: false, // 不提取注释到单独的文件
      };
      return args;
    });
  },
  publicPath: "/",
  transpileDependencies: true,
  devServer: {
    client: {
      overlay: false,
    },
  },
  pwa: {
    iconPaths: {
      favicon32: "ByteOJ.ico",
      favicon16: "ByteOJ.ico",
      appleTouchIcon: "ByteOJ.ico",
      maskIcon: "ByteOJ.ico",
      msTileImage: "ByteOJ.ico",
    },
  },
  parallel: false,
  lintOnSave: false,
  productionSourceMap: false,
});

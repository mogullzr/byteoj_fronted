const { defineConfig } = require("@vue/cli-service");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";
const JavaScriptObfuscator = require("webpack-obfuscator");

module.exports = defineConfig({
  configureWebpack: (config) => {
    if (isProduction) {
      new JavaScriptObfuscator({
        compact: false, // 压缩代码
        controlFlowFlattening: true, // 控制流扁平化
        deadCodeInjection: true, // 注入死代码
        debugProtection: true, // 启用调试保护
        debugProtectionInterval: true, // 如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，从而更难使用“开发人员工具”的其他功能。
        identifierNamesGenerator: "hexadecimal", // 变量名替换为十六进制
        log: false,
        // 是否启用全局变量和函数名称的混淆
        renameGlobals: true,
        selfDefending: true, // 启用自我防御
        rotateUnicodeArray: true,
        stringArray: true, // 启用字符串数组
        stringArrayEncoding: ["base64", "rc4"], // 对字符串数组进行编码
        rotateStringArray: true, // 字符串数组随机化
        stringArrayThreshold: 1,
        transformObjectKeys: true, // 混淆对象键名
        unicodeEscapeSequence: true, // 使用 Unicode 转义序列
        // 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
        disableConsoleOutput: true,
        comments: false, // 移除注释
      });
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

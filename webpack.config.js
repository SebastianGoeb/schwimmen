const path = require("path");
const WorkerUrlPlugin = require("worker-url/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    web: "./src/ts/web.ts",
    worker: "./src/ts/search/sa/worker.ts",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [
      { test: /\.ts$/i, use: "ts-loader" },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],

    // ! webpack5 no longer provides built-in polyfills for Node.js dependencies.
    alias: {
      os: false,
      child_process: false,
      worker_threads: false,
    },
  },
  plugins: [
    // add this
    new WorkerUrlPlugin(),
    new HtmlWebpackPlugin({
      chunks: ["web"],
      // template: "./src/ts/index.html",
    }),
    new CopyPlugin({
      patterns: [{ from: "./src/main/resources/together2.tsv", to: "./assets/together.tsv" }],
    }),
  ],
};

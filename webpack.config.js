const path = require("path");
const WorkerUrlPlugin = require("worker-url/plugin");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/ts/web.ts",
    worker: "./src/ts/search/sa/worker.ts",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader" }],
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
  ],
};

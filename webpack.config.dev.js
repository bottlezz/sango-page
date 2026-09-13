const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: {
      // Source files and the HTML template are already watched through
      // webpack's dependency graph. Only general artwork is served directly.
      directory: path.resolve(__dirname, "imgs"),
      publicPath: "/imgs",
    },
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          sourceMap: false,
        },
      },
    ],
  },
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Develpoment",
      filename: "index.html",
      inject: true,
      scriptLoading: "module",
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};

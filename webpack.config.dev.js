const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: false,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          sourceMap: true,
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

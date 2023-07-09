const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "production",
  entry: "./src/app.js",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: true,
      scriptLoading: "module",
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};

const path = require('path');

var config = {
  entry: './src/main.js',
  mode: 'development',
  output: {
    path: path.resolve('dist'),
    filename: 'gravityLab.js'
  },
  watchOptions: {
    ignored: /node_modules/
  },
  devServer: {
    contentBase: path.join(path.resolve('.'))
  }
};

module.exports = (env, argv) => {

  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }
  return config;
};

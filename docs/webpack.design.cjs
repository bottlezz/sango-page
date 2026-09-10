const path=require('path');
module.exports={
  mode:'development',devtool:false,
  entry:path.resolve(__dirname,'sango-design-entry.js'),
  output:{path:__dirname,filename:'sango-design.bundle.js'},
  resolve:{alias:{'firebase/database$':path.resolve(__dirname,'sango-design-memory.cjs')}},
  module:{rules:[{test:/\.css$/i,loader:'css-loader'}]},
};

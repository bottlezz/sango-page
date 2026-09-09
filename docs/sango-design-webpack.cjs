const path=require('path');
module.exports={mode:'development',devtool:false,entry:path.join(__dirname,'sango-design-entry.js'),output:{path:__dirname,filename:'sango-design.bundle.js'},resolve:{alias:{'firebase/database':path.join(__dirname,'sango-design-memory.cjs')}},module:{rules:[{test:/\.css$/,loader:'css-loader'}]}};

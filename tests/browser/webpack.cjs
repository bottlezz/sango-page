const path=require('path');
module.exports={mode:'development',entry:path.join(__dirname,'fixture.js'),output:{path:path.join(__dirname,'.build'),filename:'fixture.js'},resolve:{alias:{'firebase/database':path.join(__dirname,'firebase-memory.cjs')}},module:{rules:[{test:/\.css$/,loader:'css-loader'}]}};

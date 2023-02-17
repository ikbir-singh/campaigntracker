var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/instascrap');
// mongoose.connect('mongodb+srv://ikbirsingh27:qazmlp12345@cluster0.wz5gcw1.mongodb.net/instascrap');
mongoose.connect('mongodb+srv://aryan-mehta524:ikbirsingh1%40@aryancluster.7bnqahi.mongodb.net/instascrap');


//test

// test 2

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database is connected');
});

module.exports=mongoose;
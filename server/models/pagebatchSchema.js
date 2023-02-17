const mongoose = require("mongoose");

const pagebatchSchema = new mongoose.Schema({
     
    batch_id: {
        type:String,
        unique:true
    },
    batch_user_id: {
        type:String,
    },
    batch_name : {
        type : String,
    },
    batch_file_data : {
        type : String,
    },
    batch_total_links : {
        type : String,
    },
    batch_is_traverse : {
        type : String,
    },
    batch_created_at:  {
        type:String,
    }
  
});

const pagebatch = mongoose.model("coll_page_batches", pagebatchSchema);

module.exports = pagebatch;
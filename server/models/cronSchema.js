const mongoose = require("mongoose");

const cronSchema = new mongoose.Schema({
     
    cron_id: {
        type:String,
        unique:true
    },
    cron_total_links: {
        type:String,
    },
    cron_limit_set : {
        type : String,
    },
    cron_traverse_status : {
        type : String,
    },
    cron_created_at:  {
        type:String,
    }
  
});

const cron = mongoose.model("coll_crons", cronSchema);

module.exports = cron;
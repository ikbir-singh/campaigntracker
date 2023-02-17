const mongoose = require ("mongoose");

const  quicktournamentsSchema = new mongoose.Schema({
    
       
    quick_tid: {
             type:String,
        },
        quick_gid: {
            type:String,
        },
        quick_gameboost_id:{
            type:String,
        },
        quick_added_on: {
            type:String,
        }
  

});


const quicktournaments  = new mongoose.model("coll_quick_tournaments", quicktournamentsSchema);

module.exports = quicktournaments;

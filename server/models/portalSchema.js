const mongoose = require ("mongoose");

const portalSchema = new mongoose.Schema({
    id:{
        type:String,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    enabled:{
        type:String,
        
    },
    last_updated:{
        type:String,
       
    },
  

});


const portalSetting = new mongoose.model("coll_portal_settings",portalSchema);

module.exports = portalSetting;
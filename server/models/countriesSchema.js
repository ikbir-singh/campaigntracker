const mongoose = require ("mongoose");

const countriesSchema = new mongoose.Schema({
    c_id:{
        type:String,
    },
    c_name:{
        type:String,
    },
    c_country_code:{
        type:String,
    },
    c_currency_code:{
        type:String,  
    },
    c_timezone:{
        type:String,
    },
    c_status:{
        type:String,
    },
    c_created_at:{
        type:String,
    },
  

});


const countries = new mongoose.model("coll_countries",countriesSchema);

module.exports=countries;
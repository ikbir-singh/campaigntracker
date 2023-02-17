const mongoose = require ("mongoose");

const redemptionSchema = new mongoose.Schema({
    redeem_id:{
        type:String,
        unique:true
    },
    redeem_type:{
        type:String,
    },
    redeem_reward_coins:{
        type:String,
        
    },
    redeem_value:{
        type:String,
       
    },
    redeem_status:{
        type:String,
    },
    redeem_updated_on:{
        type:String,
    },
  

});

const manageRedemption = new mongoose.model("coll_redemption_settings", redemptionSchema);

module.exports = manageRedemption;
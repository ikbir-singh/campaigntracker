const mongoose = require ("mongoose");

const manageSpinWheelSchema = new mongoose.Schema({

    wheel_id:{
        type:String,
    },
    wheel_type:{
        type:String,
    },
    wheel_value:{
        type:String,
        
    },
    wheel_seq:{
        type:String,
       
    },
    wheel_added_on:{
        type:String,
    },
    wheel_updated_on:{
        type:String,
    },
   

});

const manage_Spin_Wheel = new mongoose.model("coll_spinwheel_datas", manageSpinWheelSchema);

module.exports = manage_Spin_Wheel;
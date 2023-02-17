const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
     
    reel_id: {
        type:String,
        unique:true
    },
    reel_link: {
        type:String,
    },
    project_id : {
        type : String,
        default: null,
    },
    reel_page_name:{
        type:String,
        default: null,
    },
    reel_date_of_posting: {
        type:String,
        default: null,
    },
    reel_view:  {
        type:String,
        default: null,
    },
    reel_play: {
        type:String,
        default: null,
    },
    reel_like:  {
        type:String,
        default: null,
    },
    reel_comment: {
        type:String,
        default: null,
    },
    reel_caption:  {
        type:String,
        default: null,
    },
    reel_error: {
        type:String,
        default: null,
    },
    reel_is_traverse:  {
        type:String,
    },
    reel_upload: {
        type: String,
    },
    reel_updated_at: {
        type:String,
        default: null,
    },
    reel_created_at:  {
        type:String,
    }
  
});

const reel = mongoose.model("coll_reels_2", reelSchema);

module.exports = reel;
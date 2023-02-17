const mongoose = require("mongoose");

const youtubeSchema = new mongoose.Schema({
     
    video_id: {
        type:String,
        unique:true
    },
    video_link: {
        type:String,
    },
    campaign_id : {
        type : String,
        default: null,
    },
    video_channel_id:{
        type:String,
        default: null,
    },
    video_channel_name:{
        type:String,
        default: null,
    },
    video_date_of_posting: {
        type:String,
        default: null,
    },
    video_view:  {
        type:String,
        default: null,
    },
    video_like:  {
        type:String,
        default: null,
    },
    video_comment: {
        type:String,
        default: null,
    },
    video_title:  {
        type:String,
        default: null,
    },
    video_error: {
        type:String,
        default: null,
    },
    link_is_traverse:  {
        type:String,
    },
    link_upload: {
        type: String,
        default: null,
    },
    link_updated_at: {
        type:String,
        default: null,
    },
    link_created_at:  {
        type:String,
    }
  
});

const youtube = mongoose.model("coll_youtubes", youtubeSchema);

module.exports = youtube;
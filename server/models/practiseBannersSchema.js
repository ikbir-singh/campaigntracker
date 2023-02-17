const mongoose=require ("mongoose");

const  practiceBannerSchema=new mongoose.Schema({
    
       
    banner_id: {
            type:String,
        },
        banner_game_id: {
            type:String,
        },
        banner_gameboost_id:{
            type:String,
        },
        banner_game_name: {
            type:String,
        },
        banner_game_image:  {
            type:String,
        },
        banner_image_path: {
            type:String,
        },
        banner_status:  {
            type:String,
        },
        banner_added_on: {
            type:String,
        },
        banner_updated_on:  {
            type:String,
        }     

});


const practice_banners =new mongoose.model("coll_practise_banners",practiceBannerSchema);

module.exports=practice_banners;

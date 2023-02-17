const mongoose=require ("mongoose");

const  tournamentBannersSchema=new mongoose.Schema({
    
       
    banner_id: {
            type:String,
        },
        banner_tournament_id: {
            type:String,
        },
        banner_location:{
            type:String,
        },
        banner_position: {
            type:String,
        },
        banner_image_path:  {
            type:String,
        },
        banner_status: {
            type:String,
        },
        banner_added_on:  {
            type:String,
        },
        banner_updated_on:  {
            type:String,
        },   
        uploaded:  {
            type:String,
        }     

});


const tournament_banners =new mongoose.model("coll_tournament_banners",tournamentBannersSchema);

module.exports=tournament_banners;

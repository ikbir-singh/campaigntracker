const mongoose=require ("mongoose");

const  tournamentSchema=new mongoose.Schema({
     
    tournament_id: {
        type:String,
    },
    tournament_name: {
        type:String,
    },
    tournament_game_id:{
        type:String,
    },
    tournament_gameboost_id: {
        type:String,
    },
    tournament_game_name:  {
        type:String,
    },
    tournament_game_image: {
        type:String,
    },
    tournament_desc:  {
        type:String,
    },
    tournament_type: {
        type:String,
    },
    tournament_section:  {
        type:String,
    },
    tournament_start_date: {
        type:String,
    },
    tournament_end_date:  {
        type:String,
    },
    tournament_start_time: {
        type:String,
    },
    tournament_end_time:  {
        type:String,
    },
    tournament_category:  {
        type:String,
    },
    tournament_category_id:  {
        type:String,
    },
    tournament_reward_type:  {
        type:String,
    },
    tournament_fee: {
        type:String,
        default: null,
    },
    tournament_prize_1:{
        type:String,
        default: null,
    },
    tournament_prize_2: {
        type:String,
        default: null,
    },
    tournament_prize_3:{
        type:String,
        default: null,
    },
    tournament_prize_4:{
        type:String,
        default: null,
    },
    tournament_prize_5:{
        type:String,
        default: null,
    },
    tournament_prize_6:{
        type:String,
        default: null,
    },
    tournament_prize_7: {
        type:String,
        default: null,
    },
    tournament_prize_8: {
        type:String,
        default: null,
    },
    tournament_prize_9: {
        type:String,
        default: null,
    },
    tournament_status: {
        type:String,
    },
    tournament_added_on: {
        type:String,
    },
    tournament_updated_on:{
        type:String,
    },

});


const tournaments =new mongoose.model("coll_tournaments", tournamentSchema);

module.exports = tournaments;

const mongoose=require ("mongoose");

const tournamentsFeeRewardSchema = new mongoose.Schema({
       
        fee_id: {
            type:String,
        },
        fee_turnament_id: {
            type:String,
        },
        fee_country_id:{
            type:String,
        },
        fee_country_name: {
            type:String,
        },
        fee_tournament_rewards:  {
            type:String,
        },
        fee_tournament_fee: {
            type:String,
        },
        fee_tournament_prize_1:  {
            type:String,
        },
        fee_tournament_prize_2: {
            type:String,
        },
        fee_tournament_prize_3:  {
            type:String,
        },
        fee_tournament_prize_4: {
            type:String,
        },
        fee_tournament_prize_5:  {
            type:String,
        },
        fee_tournament_prize_6: {
            type:String,
        },
        fee_tournament_prize_7:  {
            type:String,
        },
        fee_tournament_prize_8:  {
            type:String,
        },
        fee_tournament_prize_9:  {
            type:String,
        },
       
});

const tournamentsFeeRewards = new mongoose.model("coll_tournaments_fee_rewards" , tournamentsFeeRewardSchema);

module.exports = tournamentsFeeRewards;


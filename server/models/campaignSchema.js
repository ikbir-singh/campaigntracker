const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    campaign_id: {
        type: String,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    },
    campaign_name: {
        type: String,
        required: true
    },
    campaign_type: {
        type: String,
        required: true
    },
    campaign_users: [
        {
            type: String,
        }
    ],
    campaign_status: {
        type: String,
        required: true
    },
    campaign_starts_on: {
        type: String
    },
    campaign_ends_on: {
        type: String
    },
    campaign_added_on: {
        type: String
    },
    campaign_updated_on: {
        type: String
    }

});

const campaign = new mongoose.model("coll_campaigns", campaignSchema);

module.exports = campaign;
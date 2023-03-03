const mongoose = require("mongoose");

const apikeysSchema = new mongoose.Schema({
    api_id: {
        type: String,
        unique: true
    },
    api_type: {
        type: String,
        required: true
    },
    api_name: {
        type: String,
        required: true
    },
    api_key: {
        type: String,
        required: true
    },
    api_description: {
        type: String,
        default: null,
    },
    api_status: {
        type: String,
        required: true
    },
    api_comments: {
        type: String,
        default: null,
    },
    api_added_on: {
        type: String
    },
    api_updated_on: {
        type: String
    },
    hit_count: {
        type: Number,
        default: null,
    }

});

const apikeys = new mongoose.model("coll_apikeys", apikeysSchema);

module.exports = apikeys;
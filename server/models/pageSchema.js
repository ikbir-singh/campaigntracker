const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({

    page_id: {
        type: String,
        unique: true
    },
    page_link: {
        type: String,
    },
    user_id: {
        type: String,
        default: null,
    },
    page_insta_id: {
        type: String,
        default: null,
    },
    page_name: {
        type: String,
        default: null,
    },
    page_type: {
        type: String,
        default: null,
    },
    page_followers: {
        type: String,
        default: null,
    },
    page_following: {
        type: String,
        default: null,
    },
    page_total_posts: {
        type: String,
        default: null,
    },
    page_like_engagement: {
        type: String,
        default: null,
    },
    page_video_engagement: {
        type: String,
        default: null,
    },
    page_past_post_data: [
        {
            media_link:
            {
                type: String,
                default: null,
            },
            is_video:
            {
                type: String,
                default: null,
            },
            like:
            {
                type: String,
                default: null,
            },
            comment_count:
            {
                type: String,
                default: null,
            },
            view_count:
            {
                type: String,
                default: null,
            },
        }
    ],
    page_error: {
        type: String,
        default: null,
    },
    page_is_traverse: {
        type: String,
    },
    batch_id: {
        type: String,
    },
    page_updated_at: {
        type: String,
        default: null,
    },
    page_created_at: {
        type: String,
    }

});

const page = mongoose.model("coll_pages", pageSchema);

module.exports = page;
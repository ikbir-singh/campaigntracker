const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    project_id: {
        type: String,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    },
    project_name: {
        type: String,
        required: true
    },
    project_users: [
        {
            type: String,
        }
    ],
    project_status: {
        type: String,
        required: true
    },
    project_starts_on: {
        type: String
    },
    project_ends_on: {
        type: String
    },
    project_added_on: {
        type: String
    },
    project_updated_on: {
        type: String
    }

});

const project = new mongoose.model("coll_projects", projectSchema);

module.exports = project;
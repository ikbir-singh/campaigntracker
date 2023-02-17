const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const LoginSchema = new mongoose.Schema({
    user_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,

    },
    password: {
        type: String,

    },
    email: {
        type: String,

    },
    user_status: {
        type: String,

    },
    user_type: {
        type: String,

    },
    tokens: [
        {
            token:
            {
                type: String,
                required: true
            }
        }
    ],


});

LoginSchema.methods.generateAuthToken = async function () {
    try {
        
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        // await this.save();
        return token;

    }
    catch (err) {
        console.log(err)
    }
}

const Login = new mongoose.model("coll_logins", LoginSchema);

module.exports = Login;
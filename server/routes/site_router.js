const express = require("express");
const router = express.Router();

// const jwt = require("jsonwebtoken");

const authenticate = require('../middleware/authenticate');

const project = require("../models/projectSchema");
const campaign = require("../models/campaignSchema");
const reel = require("../models/reelSchema");
const youtube = require("../models/youtubeSchema");
const cron = require("../models/cronSchema");
const page = require("../models/pageSchema");
const pagebatch = require("../models/pagebatchSchema");
// const tournaments = require("../models/tournamentSchema");
// const countries = require("../models/countriesSchema");
// const tournament_fee_reward = require("../models/tournamentsFeeRewardSchema");
// const tournament_banners = require("../models/tournamentBannersSchema");
// const quick_tournaments = require("../models/quicktournamentsSchema");
// const manage_Spin_Wheel = require("../models/manageSpinWheelSchema");
// const manageRedemption = require("../models/redemptionShema");
// const portal_settings = require("../models/portalSchema");
const userLogin = require("../models/loginSchema");

const multer = require('multer')

const bcrypt = require("bcryptjs");

const http = require("https");

const fs = require('fs');


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // cb(null, '../admin/public/uploads/practise-banners')
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().getTime()+'_'+file.originalname)
//     },
// });
// const upload = multer({ storage: storage })


// for single file upload function
var uploadFnct = function (dest, file) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '../server/public/uploads/' + dest + '/');
        },
        filename: function (req, file, cb) {
            // var datetimestamp = Date.now();
            cb(null, new Date().getTime() + '_' + file.originalname);
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single(file);

    return upload;
};

// for bcrypt password 
const bcrypt_function = async (password) => {
    let bcrypt_pass = await bcrypt.hash(password, 10);
    // console.log("bcrypt_pass: "+bcrypt_pass);
    return bcrypt_pass;
}

router.get("/", (req, res) => {
    res.send('Node is Running.');

});



// testing
router.get("/testing", async (req, res) => {
    try {


        const String = "\n" + Date();
        fs.appendFile("./foo.txt", String, 'utf8', function (err) {
            if (err) {
                res.status(422).json(err);
            }
            else {
                res.status(201).json("Success");
            }
        });
    }
    catch (error) {
        res.status(422).json(error);

    }
});





//login route
router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(404).json({ error: "please fill the data" })
        }
        else {
            const user = await userLogin.findOne({ username: username });
            // console.log(user);
            if (user) {

                let user_pass = user['password'];

                let compare_password = await bcrypt.compare(password, user_pass);
                // console.log("compare_password: " + compare_password);

                if (compare_password === true) {

                    let user_status = user['user_status'];

                    if (user_status === "1") {

                        const token = await user.generateAuthToken();

                        res.cookie("usertoken", token, {
                            expires: new Date(Date.now() + 28800000), //time in milliseconds means 28800000 is 8 hours 
                            httpOnly: true
                        });
                        // console.log(cookie);
                        res.status(201).json({ message: "User Signin Successfully" });
                    }

                    else {
                        res.status(404).json({ message: "Invaild Permission! Contact to Admin" });

                    }


                }

                else {
                    res.status(404).json({ message: "Incorrect Password!" });

                }
            }
            else {
                res.status(404).json({ message: "Username Not Exist, Contact to Admin" });
            }
        }
    }

    catch (err) {
        console.log(err);

    }
});

//  logout route
router.get("/logout", async (req, res) => {
    res.clearCookie('usertoken', { path: '/' })
    res.status(201).send("Logout Successfully");
})


//get token
router.get("/gettoken", authenticate, async (req, res) => {

    let data = {};
    try {
        const userId = req.userId;
        const usertype = req.usertype;
        const user = await userLogin.findOne({ user_id: userId });
        let user_status = user['user_status'];

        if (user_status === "1") {
            data = {
                usertype: usertype,
                userId: userId
            }
            res.status(201).send(data);
        }

        else {
            res.status(404).json({ message: "Invaild Permission! Contact to Admin" });

        }

    }
    catch (error) {
        res.status(422).send(error);

    }
});

// get login details
router.get("/getLoginData/:id", async (req, res) => {
    try {

        const { id } = req.params;
        // console.log(id);

        const userData = await userLogin.findOne({ user_id: id });
        res.status(201).json(userData);

    }
    catch (error) {
        res.status(422).json(error);

    }
});





//get user list for admin
router.post("/getUser", async (req, res) => {
    const { value } = req.body;
    try {

        if (value) {
            const userdata = await userLogin.find({ user_type: "1", $or: [{ name: { $regex: value, $options: "i" } }, { username: { $regex: value, $options: "i" } }] });
            // console.log(userdata);
            if (userdata) {
                res.status(201).json(userdata);
            }
            else {
                const userdata = await userLogin.find({ user_type: "1" });
                // console.log(userdata);
                res.status(201).json(userdata);
            }
        }
        else {
            const userdata = await userLogin.find({ user_type: "1" });
            // console.log(userdata);
            res.status(201).json(userdata);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }

});


//get Active user list for admin
router.post("/getActiveUser", async (req, res) => {
    try {
        const userdata = await userLogin.find({ user_type: "1", user_status: "1" }, { name: 1, _id: 0, user_id: 1 });
        // console.log(userdata);
        res.status(201).json(userdata);
    }
    catch (error) {
        res.status(422).json(error);

    }

});


// add user 
router.post("/addUser", async (req, res) => {

    const userdatacount = (await userLogin.findOne({ user_type: "1" }).sort({ _id: -1 }).limit(1));

    const user_id = (userdatacount != null) ? parseInt(userdatacount["user_id"]) + 1 : "1";  //user id auto imcrement

    const { name, email, encryptPass } = req.body;   // getting data from user

    if (!user_id || !name || !email || !encryptPass) {
        res.status(404).json("please fill the data");
    }
    else {
        try {

            let username = email
            let user_status = 1
            let user_type = 1

            const preuser = await userLogin.findOne({ email: email });
            // console.log(preuser);

            if (preuser) {
                res.status(404).json("This email is already present");
            }
            else {

                let password = await bcrypt_function(encryptPass);
                const adduser = new userLogin({
                    user_id, name, email, password, user_type, user_status, username
                });

                await adduser.save();
                res.status(201).json(adduser);
                // console.log(adduser);
            }

        }
        catch (error) {
            res.status(404).json(error)
        }
    }

});


//get individual user detail
router.get("/getUser/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);

        const user_info = await userLogin.findOne({ user_id: id });
        // console.log(user_info);
        res.status(201).json(user_info)
    }
    catch (error) {
        res.status(422).json(error)
    }
});



//update user detail
router.patch("/updateUser/:id", async (req, res) => {

    const { id } = req.params;
    var { name, email, status, password } = req.body;

    if (!id || !name || !email || !status) {
        res.status(422).json("please fill the data");
    }
    else {
        try {
            let username = email
            if (password) {
                let bcrypt_password = await bcrypt_function(password);
                const user_update = await userLogin.findByIdAndUpdate(id, { $set: { name: name, email: email, username: username, user_status: status, password: bcrypt_password } }, {
                    new: true
                });

                // console.log(user_update);
                res.status(201).json(user_update)
            }
            else {
                const user_update = await userLogin.findByIdAndUpdate(id, { $set: { name: name, email: email, username: username, user_status: status } }, {
                    new: true
                });

                // console.log(user_update);
                res.status(201).json(user_update)
            }

        }
        catch (error) {
            res.status(422).json(error);
        }
    }

});


//delete user
router.delete("/deleteUser/:id", async (req, res) => {
    try {
        // console.log(req.params);
        const { id } = req.params;

        const user_delete = await userLogin.findByIdAndDelete({ _id: id });

        // console.log(user_delete);
        res.status(201).json(user_delete)
    }
    catch (error) {
        res.status(422).json(error);
    }
});


// update password api

router.patch("/updatePassword/:id", async (req, res) => {
    try {

        const { id } = req.params;

        var { OldPassword, NewPassword, ConfirmPassword } = req.body;

        if (id && OldPassword && NewPassword && ConfirmPassword) {

            if (NewPassword !== ConfirmPassword) {
                res.status(422).json("Confirm Password should be as New Password.");
            }
            else {
                const check_user = await userLogin.find({ user_id: id });
                // console.log(check_user);

                if (check_user[0]) {

                    let _id = check_user[0]['_id'];
                    let old_pass = check_user[0]['password'];

                    let compare_password = await bcrypt.compare(OldPassword, old_pass);

                    if (compare_password === true) {

                        let bcrypt_password = await bcrypt_function(ConfirmPassword);
                        const password_update = await userLogin.findByIdAndUpdate(_id, { $set: { password: bcrypt_password } }, {
                            new: true
                        });

                        // console.log(password_update);
                        res.status(201).json(password_update)
                    }
                    else {
                        res.status(422).json("Old Password is not Same");
                    }
                }

                else {
                    res.status(422).json("user not exists.");
                }
            }

        }
        else {
            res.status(422).json("please fill the data");
        }



    }
    catch (error) {
        res.status(422).json(error);
    }

});


//get projectlist for header
router.post("/getHeaderProjectList", async (req, res) => {
    const { user_id, UserType } = req.body;
    try {
        if (UserType === '-1') {
            const projectdata = await project.find({ project_status: "1" });
            // console.log(projectdata);
            res.status(201).json(projectdata);
        }
        else if (user_id) {
            const projectdata = await project.find({ project_status: "1", project_users: user_id });
            // console.log(projectdata);
            res.status(201).json(projectdata);
        }
        else {
            res.status(422).json("please fill the data");
        }
    }
    catch (error) {
        res.status(422).json(error);

    }

});

//get projectlist
router.post("/getProject", async (req, res) => {
    const { user_id, value } = req.body;
    try {
        if (user_id) {
            if (value) {
                const projectdata = await project.find({ project_users: user_id, project_name: { $regex: value, $options: "i" } });
                // console.log(projectdata);
                if (projectdata) {
                    res.status(201).json(projectdata);
                }
                else {
                    const projectdata = await project.find({ project_users: user_id });
                    // console.log(projectdata);
                    res.status(201).json(projectdata);
                }
            }
            else {
                const projectdata = await project.find({ project_users: user_id });
                // console.log(projectdata);
                res.status(201).json(projectdata);
            }

        }

        else {
            if (value) {
                const projectdata = await project.find({ project_name: { $regex: value, $options: "i" } });
                // console.log(projectdata);
                if (projectdata) {
                    res.status(201).json(projectdata);
                }
                else {
                    const projectdata = await project.find();
                    // console.log(projectdata);
                    res.status(201).json(projectdata);
                }
            }
            else {
                const projectdata = await project.find();
                // console.log(projectdata);
                res.status(201).json(projectdata);
            }
        }

    }
    catch (error) {
        res.status(422).json(error);

    }

});


// add project 
router.post("/addProject", async (req, res) => {

    const projectdatacount = (await project.findOne().sort({ _id: -1 }).limit(1));

    const project_id = (projectdatacount != null) ? parseInt(projectdatacount["project_id"]) + 1 : "1";  //project id auto imcrement

    const project_added_on = Date();  // added on date

    const project_updated_on = Date();   // added on date

    const { user_id, projectName, startDate, selectedusers } = req.body;   // getting data from user

    // console.log(selectedusers);

    let project_name = projectName
    let project_starts_on = startDate
    let d = new Date(startDate);
    let date = (d.getFullYear() + 1) + '-' + (d.getMonth() + 1) + '-' + ((d.getDate() < 10) ? '0' + d.getDate() : d.getDate())
    let project_ends_on = date
    let project_status = 1
    let project_users = selectedusers;

    if (!user_id || !project_name || !project_starts_on || !project_ends_on || !project_status) {
        res.status(404).json("please fill the data");
    }
    else {
        try {
            const preproject = await project.findOne({ project_name: project_name });
            // console.log(preproject);

            if (preproject) {
                res.status(404).json("This project name is already present");
            }
            else {
                const addproject = new project({
                    user_id, project_id, project_name, project_status, project_users, project_starts_on, project_ends_on, project_added_on, project_updated_on
                });

                await addproject.save();
                res.status(201).json(addproject);
                // console.log(addproject);
            }

        }
        catch (error) {
            res.status(404).json(error)
        }
    }



});


//get individual project detail
router.get("/getProject/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);

        const project_info = await project.findOne({ project_id: id });
        // console.log(project_info);
        res.status(201).json(project_info)
    }
    catch (error) {
        res.status(422).json(error)
    }
});



//update project
router.patch("/updateProject/:id", async (req, res) => {

    const { id } = req.params;
    var { projectStatus, startDate, project_updated_on, selectedusers } = req.body;

    if (!id || !projectStatus || !startDate || !project_updated_on) {
        res.status(422).json("please fill the data");
    }
    else {
        try {
            // console.log(req.params);
            let project_users = selectedusers;

            const project_update = await project.findByIdAndUpdate(id, { $set: { project_status: projectStatus, project_starts_on: startDate, project_updated_on: project_updated_on, project_users: project_users } }, {
                new: true
            });

            // console.log(project_update);
            res.status(201).json(project_update)
        }
        catch (error) {
            res.status(422).json(error);
        }
    }

});


//delete project
router.delete("/deleteProject/:id", async (req, res) => {
    try {
        // console.log(req.params);
        const { id } = req.params;

        const project_delete = await project.findByIdAndDelete({ _id: id });

        // console.log(project_delete);
        res.status(201).json(project_delete)
    }
    catch (error) {
        res.status(422).json(error);
    }
});

//get campaignlist
router.post("/getCampaign", async (req, res) => {
    const { user_id, value, campaignType } = req.body;
    try {
        if (!campaignType) {
            res.status(422).json("Campaign Type Required");
        }
        else if (user_id) {
            if (value) {
                const campaigndata = await campaign.find({ campaign_type: campaignType, campaign_users: user_id, campaign_name: { $regex: value, $options: "i" } });
                // console.log(campaigndata);
                if (campaigndata) {
                    res.status(201).json(campaigndata);
                }
                else {
                    const campaigndata = await campaign.find({ campaign_type: campaignType, campaign_users: user_id });
                    // console.log(campaigndata);
                    res.status(201).json(campaigndata);
                }
            }
            else {
                const campaigndata = await campaign.find({ campaign_type: campaignType, campaign_users: user_id });
                // console.log(campaigndata);
                res.status(201).json(campaigndata);
            }

        }

        else {
            if (value) {
                const campaigndata = await campaign.find({ campaign_type: campaignType, campaign_name: { $regex: value, $options: "i" } });
                // console.log(campaigndata);
                if (campaigndata) {
                    res.status(201).json(campaigndata);
                }
                else {
                    const campaigndata = await campaign.find({ campaign_type: campaignType });
                    // console.log(campaigndata);
                    res.status(201).json(campaigndata);
                }
            }
            else {
                const campaigndata = await campaign.find({ campaign_type: campaignType });
                // console.log(campaigndata);
                res.status(201).json(campaigndata);
            }
        }

    }
    catch (error) {
        res.status(422).json(error);

    }

});


// add campaign 
router.post("/addCampaign", async (req, res) => {

    const campaigndatacount = (await campaign.findOne().sort({ _id: -1 }).limit(1));

    const campaign_id = (campaigndatacount != null) ? parseInt(campaigndatacount["campaign_id"]) + 1 : "1";  //campaign id auto imcrement

    const campaign_added_on = Date();  // added on date

    const campaign_updated_on = Date();   // added on date

    const { user_id, campaignName, campaignType, startDate, selectedusers } = req.body;   // getting data from user

    // console.log(selectedusers);

    let campaign_name = campaignName
    let campaign_type = campaignType
    let campaign_starts_on = startDate
    let d = new Date(startDate);
    let date = (d.getFullYear() + 1) + '-' + (d.getMonth() + 1) + '-' + ((d.getDate() < 10) ? '0' + d.getDate() : d.getDate())
    let campaign_ends_on = date
    let campaign_status = 1
    let campaign_users = selectedusers;

    if (!user_id || !campaign_name || !campaign_type || !campaign_starts_on || !campaign_ends_on || !campaign_status) {
        res.status(404).json("please fill the data");
    }
    else {
        try {
            const precampaign = await campaign.findOne({ campaign_name: campaign_name, campaign_type: campaign_type });
            // console.log(precampaign);

            if (precampaign) {
                res.status(404).json("This campaign name is already present");
            }
            else {
                const addcampaign = new campaign({
                    user_id, campaign_id, campaign_name, campaign_type, campaign_status, campaign_users, campaign_starts_on, campaign_ends_on, campaign_added_on, campaign_updated_on
                });

                await addcampaign.save();
                res.status(201).json(addcampaign);
                // console.log(addcampaign);
            }

        }
        catch (error) {
            res.status(404).json(error)
        }
    }



});


//get individual campaign detail
router.get("/getCampaign/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);

        const campaign_info = await campaign.findOne({ campaign_id: id });
        // console.log(campaign_info);
        res.status(201).json(campaign_info)
    }
    catch (error) {
        res.status(422).json(error)
    }
});



//update campaign
router.patch("/updateCampaign/:id", async (req, res) => {

    const { id } = req.params;
    var { campaignStatus, startDate, campaign_updated_on, selectedusers } = req.body;

    if (!id || !campaignStatus || !startDate || !campaign_updated_on) {
        res.status(422).json("please fill the data");
    }
    else {
        try {
            // console.log(req.params);
            let campaign_users = selectedusers;

            const campaign_update = await campaign.findByIdAndUpdate(id, { $set: { campaign_status: campaignStatus, campaign_starts_on: startDate, campaign_updated_on: campaign_updated_on, campaign_users: campaign_users } }, {
                new: true
            });

            // console.log(campaign_update);
            res.status(201).json(campaign_update)
        }
        catch (error) {
            res.status(422).json(error);
        }
    }

});


//delete campaign
router.delete("/deleteCampaign/:id", async (req, res) => {
    try {
        // console.log(req.params);
        const { id } = req.params;

        const campaign_delete = await campaign.findByIdAndDelete({ _id: id });

        // console.log(campaign_delete);
        res.status(201).json(campaign_delete)
    }
    catch (error) {
        res.status(422).json(error);
    }
});


//get reellist
router.get("/getReel/:project_id", async (req, res) => {
    try {
        const { project_id } = req.params;
        // console.log(id);
        // const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1' }).sort({ reel_updated_at: -1 });
        // console.log(reeldata);

        const reeldata = await reel.aggregate(
            [
                { $match: { project_id: project_id, reel_is_traverse: '1' } },
                { $group: { _id: "$reel_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                { $sort: { "doc.reel_updated_at": -1 } },
            ],
            { collation: { locale: "en_US", numericOrdering: true } }
        )

        res.status(201).json(reeldata);
    }
    catch (error) {
        res.status(422).json(error);

    }
});
//get videolist

router.get("/getVideo/:campaign_id", async (req, res) => {
    try {
        const { campaign_id } = req.params;

        const videodata = await youtube.find({ campaign_id: campaign_id, link_is_traverse: '1' }).sort({ link_updated_at: -1 });
        res.status(201).json(videodata);
        // console.log(videodata);
    }
    catch (error) {
        res.status(422).json(error);

    }
});


//get reellist where
router.post("/getReel", async (req, res) => {
    const { project_id, start_date, end_date } = req.body;
    // console.log("project_id: "+project_id)
    // console.log("start_date: "+start_date)
    // console.log("end_date: "+end_date)

    try {
        if (!project_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1', reel_updated_at: { $lte: end_date, $gte: start_date } }).sort({ reel_updated_at: -1 });
                // console.log(reeldata);
                res.status(201).json(reeldata);
            }
            else if (start_date) {
                const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1', reel_updated_at: { '$regex': start_date } }).sort({ reel_updated_at: -1 });
                // console.log(reeldata)
                res.status(201).json(reeldata);
            }
            else {
                res.status(422).json(error);
            }
            // console.log(reeldata);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get videolist where
router.post("/getVideo", async (req, res) => {
    const { campaign_id, start_date, end_date } = req.body;
    // console.log("campaign_id: "+campaign_id)
    // console.log("start_date: "+start_date)
    // console.log("end_date: "+end_date)

    try {
        if (!campaign_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const videodata = await youtube.find({ campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { $lte: end_date, $gte: start_date } }).sort({ link_updated_at: -1 });
                // console.log(videodata);
                res.status(201).json(videodata);
            }
            else if (start_date) {
                const videodata = await youtube.find({ campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { '$regex': start_date } }).sort({ link_updated_at: -1 });
                // console.log(videodata)
                res.status(201).json(videodata);
            }
            else {
                res.status(422).json(error);
            }
            // console.log(videodata);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});


//get reeldata for table 
router.post("/getReelDataforTable", async (req, res) => {
    const { project_id, start_date, end_date } = req.body;
    // console.log("project_id: "+project_id)
    // console.log("start_date: "+start_date)
    // console.log("end_date: "+end_date)

    try {
        if (!project_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                // const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1', reel_updated_at: { $lte: end_date, $gte: start_date } }).sort({ reel_play: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(5);

                const reeldata = await reel.aggregate(
                    [
                        { $match: { project_id: project_id, reel_is_traverse: '1', reel_updated_at: { $lte: end_date, $gte: start_date } } },
                        { $group: { _id: "$reel_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.reel_play": -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )


                // console.log(reeldata);
                res.status(201).json(reeldata);
            }
            else if (start_date) {
                // const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1', reel_updated_at: { '$regex': start_date } }).sort({ reel_play: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(5);

                const reeldata = await reel.aggregate(
                    [
                        { $match: { project_id: project_id, reel_is_traverse: '1', reel_updated_at: { '$regex': start_date } } },
                        { $group: { _id: "$reel_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.reel_play": -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )


                // console.log(reeldata)
                res.status(201).json(reeldata);
            }
            else if (project_id) {
                // const reeldata = await reel.find({ project_id: project_id, reel_is_traverse: '1' }).sort({ reel_play: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(5);
                // // console.log(reeldata)

                const reeldata = await reel.aggregate(
                    [
                        { $match: { project_id: project_id, reel_is_traverse: '1' } },
                        //   { $sort: { reel_play : -1 } },
                        { $group: { _id: "$reel_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.reel_play": -1 } },
                        //   { $sort: { reel_play : -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )



                // console.log(reeldata)

                res.status(201).json(reeldata);
            }
            else {
                res.status(422).json(error);
            }
            // console.log(reeldata);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get videodata for table 
router.post("/getVideodataforTable", async (req, res) => {
    const { campaign_id, start_date, end_date } = req.body;
    // console.log("campaign_id: "+campaign_id)
    // console.log("start_date: "+start_date)
    // console.log("end_date: "+end_date)

    try {
        if (!campaign_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {

                const videodata = await youtube.aggregate(
                    [
                        { $match: { campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { $lte: end_date, $gte: start_date } } },
                        { $group: { _id: "$video_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.video_view": -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )


                // console.log(videodata);
                res.status(201).json(videodata);
            }
            else if (start_date) {

                const videodata = await youtube.aggregate(
                    [
                        { $match: { campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { '$regex': start_date } } },
                        { $group: { _id: "$video_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.video_view": -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )


                // console.log(videodata)
                res.status(201).json(videodata);
            }
            else if (campaign_id) {

                const videodata = await youtube.aggregate(
                    [
                        { $match: { campaign_id: campaign_id, link_is_traverse: '1' } },
                        { $group: { _id: "$video_link", doc: { $last: "$$ROOT" }, count: { $sum: 1 } } },
                        { $sort: { "doc.video_view": -1 } },
                        { "$limit": 20 }
                    ],
                    { collation: { locale: "en_US", numericOrdering: true } }
                )
                // console.log(videodata)

                res.status(201).json(videodata);
            }
            else {
                res.status(422).json(error);
            }
            // console.log(videodata);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get reeldata for graph
router.post("/getReelDetailsforGrpah", async (req, res) => {

    const { project_id, start_date, end_date } = req.body;

    // console.log(project_id)
    // console.log(start_date)
    // console.log(end_date)


    try {
        if (!project_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const reeldata = await reel.aggregate([
                    {
                        $addFields: {
                            reel_updated_at: {
                                $arrayElemAt: [{ $split: ["$reel_updated_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { project_id: project_id, reel_is_traverse: '1', reel_updated_at: { $lte: end_date, $gte: start_date } } },
                    {
                        $group: {
                            _id: "$reel_updated_at",
                            data: { $addToSet: { reelview: '$reel_play', reellike: '$reel_like', reelcomment: "$reel_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_updated_at: -1 }
                    }
                ])

                res.status(201).json(reeldata);
            }
            else if (start_date) {
                const reeldata = await reel.aggregate([
                    {
                        $addFields: {
                            reel_updated_at: {
                                $arrayElemAt: [{ $split: ["$reel_updated_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { project_id: project_id, reel_is_traverse: '1', reel_updated_at: { '$regex': start_date } } },
                    {
                        $group: {
                            _id: "$reel_updated_at",
                            data: { $addToSet: { reelview: '$reel_play', reellike: '$reel_like', reelcomment: "$reel_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_updated_at: -1 }
                    }
                ])

                res.status(201).json(reeldata);
            }
            else if (project_id) {

                const reeldata = await reel.aggregate([
                    { $match: { project_id: project_id, reel_is_traverse: '1' } },
                    {
                        $addFields: {
                            reel_updated_at: {
                                $arrayElemAt: [{ $split: ["$reel_updated_at", " "] }, 0]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$reel_updated_at",
                            data: { $addToSet: { reelview: '$reel_play', reellike: '$reel_like', reelcomment: "$reel_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_updated_at: -1 }
                    }
                ])

                // console.log(reeldata)

                res.status(201).json(reeldata);
            }
            else {
                res.status(422).json(error);
            }
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});


//get videodata for graph
router.post("/getVideoDetailsforGrpah", async (req, res) => {

    const { campaign_id, start_date, end_date } = req.body;

    // console.log(campaign_id)
    // console.log(start_date)
    // console.log(end_date)


    try {
        if (!campaign_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const videodata = await youtube.aggregate([
                    {
                        $addFields: {
                            link_updated_at: {
                                $arrayElemAt: [{ $split: ["$link_updated_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { $lte: end_date, $gte: start_date } } },
                    {
                        $group: {
                            _id: "$link_updated_at",
                            data: { $addToSet: { videoview: '$video_view', videolike: '$video_like', videocomment: "$video_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_updated_at: -1 }
                    }
                ])

                res.status(201).json(videodata);
            }
            else if (start_date) {
                const videodata = await youtube.aggregate([
                    {
                        $addFields: {
                            link_updated_at: {
                                $arrayElemAt: [{ $split: ["$link_updated_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { campaign_id: campaign_id, link_is_traverse: '1', link_updated_at: { '$regex': start_date } } },
                    {
                        $group: {
                            _id: "$link_updated_at",
                            data: { $addToSet: { videoview: '$video_view', videolike: '$video_like', videocomment: "$video_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_updated_at: -1 }
                    }
                ])

                res.status(201).json(videodata);
            }
            else if (campaign_id) {

                const videodata = await youtube.aggregate([
                    { $match: { campaign_id: campaign_id, link_is_traverse: '1' } },
                    {
                        $addFields: {
                            link_updated_at: {
                                $arrayElemAt: [{ $split: ["$link_updated_at", " "] }, 0]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$link_updated_at",
                            data: { $addToSet: { videoview: '$video_view', videolike: '$video_like', videocomment: "$video_comment" } },
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_updated_at: -1 }
                    }
                ])

                // console.log(videodata)

                res.status(201).json(videodata);
            }
            else {
                res.status(422).json(error);
            }
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get upload link for graph
router.post("/getuploadLinkDataforGrpah", async (req, res) => {

    const { project_id, start_date, end_date } = req.body;

    // console.log(project_id)
    // console.log(start_date)
    // console.log(end_date)


    try {
        if (!project_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const reeldata = await reel.aggregate([
                    {
                        $addFields: {
                            reel_created_at: {
                                $arrayElemAt: [{ $split: ["$reel_created_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { project_id: project_id, reel_upload: '1', reel_created_at: { $lte: end_date, $gte: start_date } } },
                    {
                        $group: {
                            _id: "$reel_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_created_at: -1 }
                    }
                ])

                res.status(201).json(reeldata);
            }
            else if (start_date) {
                const reeldata = await reel.aggregate([
                    {
                        $addFields: {
                            reel_created_at: {
                                $arrayElemAt: [{ $split: ["$reel_created_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { project_id: project_id, reel_upload: '1', reel_created_at: { '$regex': start_date } } },
                    {
                        $group: {
                            _id: "$reel_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_created_at: -1 }
                    }
                ])

                res.status(201).json(reeldata);
            }
            else if (project_id) {

                const reeldata = await reel.aggregate([
                    { $match: { project_id: project_id, reel_upload: '1' } },
                    {
                        $addFields: {
                            reel_created_at: {
                                $arrayElemAt: [{ $split: ["$reel_created_at", " "] }, 0]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$reel_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { reel_created_at: -1 }
                    }
                ])

                // console.log(reeldata)

                res.status(201).json(reeldata);
            }
            else {
                res.status(422).json(error);
            }
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get upload link for graph for youtube camapign
router.post("/getuploadLinkDataforGraph", async (req, res) => {

    const { campaign_id, start_date, end_date } = req.body;

    // console.log(campaign_id)
    // console.log(start_date)
    // console.log(end_date)


    try {
        if (!campaign_id) {
            res.status(404).json("please fill the data");
        }
        else {

            if (end_date && start_date) {
                const linkdata = await youtube.aggregate([
                    {
                        $addFields: {
                            link_created_at: {
                                $arrayElemAt: [{ $split: ["$link_created_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { campaign_id: campaign_id, link_upload: '1', link_created_at: { $lte: end_date, $gte: start_date } } },
                    {
                        $group: {
                            _id: "$link_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_created_at: -1 }
                    }
                ])

                res.status(201).json(linkdata);
            }
            else if (start_date) {
                const linkdata = await youtube.aggregate([
                    {
                        $addFields: {
                            link_created_at: {
                                $arrayElemAt: [{ $split: ["$link_created_at", " "] }, 0]
                            }
                        }
                    },
                    { $match: { campaign_id: campaign_id, link_upload: '1', link_created_at: { '$regex': start_date } } },
                    {
                        $group: {
                            _id: "$link_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_created_at: -1 }
                    }
                ])

                res.status(201).json(linkdata);
            }
            else if (campaign_id) {

                const linkdata = await youtube.aggregate([
                    { $match: { campaign_id: campaign_id, link_upload: '1' } },
                    {
                        $addFields: {
                            link_created_at: {
                                $arrayElemAt: [{ $split: ["$link_created_at", " "] }, 0]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$link_created_at",
                            links: { $sum: 1 },
                        }
                    },
                    {
                        $sort: { link_created_at: -1 }
                    }
                ])

                // console.log(linkdata)

                res.status(201).json(linkdata);
            }
            else {
                res.status(422).json(error);
            }
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});



// add Reel link
router.post("/addReelLink", async (req, res) => {

    const reeldatacount = (await reel.findOne().sort({ _id: -1 }).limit(1));

    const reel_id = (reeldatacount != null) ? parseInt(reeldatacount["reel_id"]) + 1 : "1";  //reel id auto imcrement

    const { reel_link, project_id, reel_is_traverse, reel_upload, reel_created_at, cronfunction } = req.body;   // getting data from user

    if (!reel_link || !project_id || !reel_created_at) {
        res.status(404).json("please fill the data");
    }
    else {
        try {

            var prereel = 0;

            if (!cronfunction) {
                var reel_link_info = reel_link.split("/");

                prereel = await reel.findOne({ reel_link: { '$regex': reel_link_info[4] }, project_id: project_id });
                // console.log(prereel);
            }

            if (prereel) {
                res.status(401).json("This reel link is already present");
            }
            else {

                const addReel = new reel({
                    reel_id, reel_link, project_id, reel_is_traverse, reel_upload, reel_created_at
                });

                await addReel.save();
                res.status(201).json(addReel);
                // console.log(addReel);
            }
        }
        catch (error) {
            res.status(404).json(error)
        }
    }

});

// add Campaign  link
router.post("/addCampaignLink", async (req, res) => {

    const { video_link, campaign_id, link_is_traverse, link_upload, link_created_at, cronfunction } = req.body;   // getting data from user

    if (!video_link || !campaign_id || !link_created_at) {
        res.status(404).json("please fill the data");
        return;
    }

    const campaign_type = (await campaign.findOne({ campaign_id: campaign_id, campaign_status: '1' }, { campaign_type: 1, _id: 0 }) ? (await campaign.findOne({ campaign_id: campaign_id, campaign_status: '1' }, { campaign_type: 1, _id: 0 })).campaign_type : null);

    if (campaign_type === 'Youtube') {

        const videodatacount = (await youtube.findOne().sort({ _id: -1 }).limit(1));

        const video_id = (videodatacount != null) ? parseInt(videodatacount["video_id"]) + 1 : "1";  //video id auto imcrement

        try {

            var checklink = 0;

            if (!cronfunction) {

                var link_info = YoutubeUrl(video_link);

                // console.log(link_info);

                if (!link_info) {
                    res.status(401).json("link is not vaild");
                    return;
                }
                if (!(link_info.type === 'video' || link_info.type === 'shorts')) {
                    res.status(401).json("This is not a Youtube Shorts Or Video Link");
                    return;
                }

                // var video_details = await youtubevideodetails(link_info.data);
                // console.log(video_details);

                checklink = await youtube.findOne({ video_link: { '$regex': link_info.data }, campaign_id: campaign_id });
            }

            if (checklink) {
                res.status(401).json("This link is already present");
            }
            else {

                const addlink = new youtube({
                    video_id, video_link, campaign_id, link_is_traverse, link_upload, link_created_at
                });

                await addlink.save();
                res.status(201).json(addlink);
                // console.log(addlink);
            }
        }
        catch (error) {
            res.status(404).json(error)
        }

    }



});


// add page links
router.post("/addPageLink", async (req, res) => {

    const pagedatacount = (await page.findOne().sort({ _id: -1 }).limit(1));

    const page_id = (pagedatacount != null) ? parseInt(pagedatacount["page_id"]) + 1 : "1";  //page id auto imcrement

    const { page_link, user_id, page_created_at, record_numbers, fileName, isfile, filerefrencedata } = req.body;   // getting data from user

    if (!page_link || !user_id || !page_created_at) {
        res.status(404).json("please fill the data");
    }
    else {
        try {

            var page_link_info = page_link.split("/")[3]
            if (page_link_info)
                page_link_info = page_link_info.split('?');
            if (page_link_info) {
                //create a batch id and a enter some details according to batch id 
                var batch_id = "0";
                if (isfile) {
                    const batchdata = await pagebatch.findOne({ batch_file_data: filerefrencedata });
                    if (!batchdata) {
                        var batch_total_links = record_numbers;
                        const batchdatacount = (await pagebatch.findOne().sort({ _id: -1 }).limit(1));
                        batch_id = (batchdatacount != null) ? parseInt(batchdatacount["batch_id"]) + 1 : "1";  //batch id auto increment
                        const batch_created_at = page_created_at;
                        const batch_name = fileName;
                        const batch_file_data = filerefrencedata
                        const batch_user_id = user_id;
                        const batch_is_traverse = "0";

                        const addBatch = new pagebatch({
                            batch_id, batch_user_id, batch_name, batch_file_data, batch_total_links, batch_is_traverse, batch_created_at
                        });

                        await addBatch.save();
                        batch_id = addBatch.batch_id
                    }
                    else {
                        batch_id = batchdata.batch_id
                    }
                }
                else {
                    const batchdatacount = (await pagebatch.findOne().sort({ _id: -1 }).limit(1));
                    batch_id = (batchdatacount != null) ? parseInt(batchdatacount["batch_id"]) + 1 : "1";  //batch id auto increment
                    const batch_created_at = page_created_at;
                    const batch_name = "Single Link At " + batch_created_at;
                    const batch_user_id = user_id;
                    const batch_is_traverse = "0";


                    const addBatch = new pagebatch({
                        batch_id, batch_user_id, batch_name, batch_is_traverse, batch_created_at
                    });

                    await addBatch.save();
                    batch_id = addBatch.batch_id
                }

                if (batch_id) {
                    var page_is_traverse = "0";

                    var prepage = await page.findOne({ page_link: { '$regex': page_link_info[0] }, batch_id: batch_id });

                    if (prepage) {
                        res.status(401).json("Page link is already present in this File");
                    }
                    else {

                        const addPage = new page({
                            page_id, page_link, user_id, page_is_traverse, batch_id, page_created_at
                        });

                        await addPage.save();
                        res.status(201).json(addPage);
                        // console.log(addPage);
                    }
                }
                else {
                    res.status(401).json("Some Error occur in batch id");
                }
            }
            else {
                res.status(404).json("Link is not valid");
            }

        }
        catch (error) {
            res.status(404).json(error)
        }
    }

});


//get batch data
router.post("/getBatchData", async (req, res) => {
    const { value, user_id } = req.body;
    try {

        if (user_id) {
            if (value) {
                const batchdata = await pagebatch.find({ batch_user_id: user_id, batch_name: { $regex: value, $options: "i" } }).sort({ _id: -1 });
                if (batchdata.length > 0) {
                    res.status(201).json(batchdata);
                }
                else {
                    const pagedata = await page.find({ user_id: user_id, page_link: { $regex: value, $options: "i" } }, { batch_id: 1, _id: 0 });
                    if (pagedata.length > 0) {
                        let pagebatchid = pagedata.map(element => element.batch_id);
                        const batchdata = await pagebatch.find({ batch_id: pagebatchid }).sort({ _id: -1 });
                        // console.log(batchdata);
                        res.status(201).json(batchdata);
                    }
                    else {
                        const batchdata = await pagebatch.find({ batch_user_id: user_id, batch_name: { $regex: value, $options: "i" } }).sort({ _id: -1 });
                        // console.log(batchdata);
                        res.status(201).json(batchdata);
                    }
                }
            }
            else {
                const batchdata = await pagebatch.find({ batch_user_id: user_id }).sort({ _id: -1 });
                // console.log(batchdata);
                res.status(201).json(batchdata);
            }
        }
        else {
            if (value) {
                const batchdata = await pagebatch.find({ batch_name: { $regex: value, $options: "i" } }).sort({ _id: -1 });
                if (batchdata.length > 0) {
                    res.status(201).json(batchdata);
                }
                else {
                    const pagedata = await page.find({ page_link: { $regex: value, $options: "i" } }, { batch_id: 1, _id: 0 });
                    if (pagedata.length > 0) {
                        let pagebatchid = pagedata.map(element => element.batch_id);
                        const batchdata = await pagebatch.find({ batch_id: pagebatchid }).sort({ _id: -1 });
                        // console.log(batchdata);
                        res.status(201).json(batchdata);
                    }
                    else {
                        const batchdata = await pagebatch.find({}).sort({ _id: -1 });
                        // console.log(batchdata);
                        res.status(201).json(batchdata);
                    }
                }
            }
            else {
                const batchdata = await pagebatch.find({}).sort({ _id: -1 });
                // console.log(batchdata);
                res.status(201).json(batchdata);
            }
        }

    }
    catch (error) {
        res.status(422).json(error);

    }

});


//get page detail according to batch id
router.post("/getPageData", async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(422).json({ error: "please fill the data" })
        }
        else {
            const pagedata = await page.find({ batch_id: id });
            // console.log(pagedata);
            res.status(201).json(pagedata)
        }
    }
    catch (error) {
        res.status(422).json(error)
    }
});



//get Traverse cron data  
router.get("/getTraverseCronData", async (req, res) => {

    // to get date today
    let today = new Date();

    let date = today.toLocaleString('en-GB').split('/');
    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // console.log(date_needed);


    try {

        if (date_needed) {
            const crondata = await cron.findOne({ cron_traverse_status: '2', cron_created_at: date_needed });
            if (!crondata) {
                const cron_total_links = await reel.find({ reel_is_traverse: '2', reel_updated_at: { '$regex': date_needed } }).count();
                if (cron_total_links) {
                    var cron_limit_set = Math.round(parseInt(cron_total_links) / 2);
                    const crondatacount = (await cron.findOne().sort({ _id: -1 }).limit(1));
                    const cron_id = (crondatacount != null) ? parseInt(crondatacount["cron_id"]) + 1 : "1";  //cron id auto imcrement
                    const cron_created_at = date_needed;
                    const cron_traverse_status = 2;

                    const addCron = new cron({
                        cron_id, cron_total_links, cron_limit_set, cron_traverse_status, cron_created_at
                    });

                    await addCron.save();
                    res.status(201).json(addCron);
                }
                else {
                    res.status(422).json(error);
                }

            }
            else {
                res.status(201).json(crondata);
            }

        }
        else {
            res.status(422).json(error);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get Non Traverse cron data  
router.get("/getCronData", async (req, res) => {

    // to get date today
    let today = new Date();

    let date = today.toLocaleString('en-GB').split('/');
    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // console.log(date_needed);

    let require_date = new Date(today);
    require_date.setDate(today.getDate() - 1);
    let y_date = require_date.toLocaleString('en-GB').split('/');
    let y_time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
    let yesterday_date = y_time[0] + "-" + y_date[1] + "-" + y_date[0];



    try {

        if (date_needed) {
            const crondata = await cron.findOne({ cron_traverse_status: '0', cron_created_at: date_needed });
            if (!crondata) {
                const cron_total_links = await reel.find({ reel_created_at: { '$regex': yesterday_date } }).count();
                if (cron_total_links) {
                    var cron_limit_set = Math.round(parseInt(cron_total_links) / 4);
                    const crondatacount = (await cron.findOne().sort({ _id: -1 }).limit(1));
                    const cron_id = (crondatacount != null) ? parseInt(crondatacount["cron_id"]) + 1 : "1";  //cron id auto imcrement
                    const cron_created_at = date_needed;
                    const cron_traverse_status = 0;

                    const addCron = new cron({
                        cron_id, cron_total_links, cron_limit_set, cron_traverse_status, cron_created_at
                    });

                    await addCron.save();
                    res.status(201).json(addCron);
                }
                else {
                    res.status(422).json(error);
                }

            }
            else {
                res.status(201).json(crondata);
            }

        }
        else {
            res.status(422).json(error);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});



//get Non Traverse reeldata for cron 
router.get("/getReelData/:limit", async (req, res) => {

    // to get date one day previous
    let today = new Date();
    let require_date = new Date(today);
    require_date.setDate(today.getDate() - 1);
    let date = require_date.toLocaleString('en-GB').split('/');
    let time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
    let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // // console.log(date_needed);

    const { limit } = req.params;

    // // to get date today
    // let today = new Date();

    // let date = today.toLocaleString('en-GB').split('/');
    // let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    // let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // console.log(date_needed);


    try {

        if (date_needed) {
            const reeldata = await reel.find({ reel_is_traverse: '0', reel_created_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(limit);
            // console.log(reeldata.length);

            res.status(201).json(reeldata);
        }
        else {
            res.status(422).json(error);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});

//get Traverse reeldata for cron 
router.get("/getTraverseReelData/:limit", async (req, res) => {

    // // to get date one day previous
    // let today = new Date();
    // let require_date = new Date(today);
    // require_date.setDate(today.getDate() - 1);
    // let date = require_date.toLocaleString('en-GB').split('/');
    // let time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
    // let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // // console.log(date_needed);

    const { limit } = req.params;

    // to get date today
    let today = new Date();

    let date = today.toLocaleString('en-GB').split('/');
    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // console.log(date_needed);


    try {

        if (date_needed) {
            const reeldata = await reel.find({ reel_is_traverse: '2', reel_updated_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(limit);
            // console.log(reeldata.length);

            res.status(201).json(reeldata);
        }
        else {
            res.status(422).json(error);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});


//get Retry Traverse reeldata for cron 
router.get("/retryTraverseReelData", async (req, res) => {

    const { limit } = req.params;

    // to get date today
    let today = new Date();

    let date = today.toLocaleString('en-GB').split('/');
    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    let date_needed = time[0] + "-" + date[1] + "-" + date[0];

    // console.log(date_needed);


    try {

        if (date_needed) {
            const reeldata = await reel.find({ reel_is_traverse: '3', reel_updated_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true });
            // console.log(reeldata.length);

            res.status(201).json(reeldata);
        }
        else {
            res.status(422).json(error);
        }
    }
    catch (error) {
        res.status(422).json(error);

    }
});


//update category
router.patch("/updateReelData/:id", async (req, res) => {
    try {
        // console.log(req.params);
        const { id } = req.params;
        // console.log(id);


        const reel_update = await reel.findByIdAndUpdate(id, req.body, {
            new: true
        });

        // console.log(reel_update);
        res.status(201).json(reel_update)
    }
    catch (error) {
        res.status(422).json(error);
    }

});



function datetime(type, days) {
    if (type === 'currentdate') {
        let today = new Date();
        let date = today.toLocaleString('en-GB').split('/');
        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
        date = time[0] + "-" + date[1] + "-" + date[0];
        return date;
    }
    if (type === 'currentdatetime') {
        let today = new Date();
        let date = today.toLocaleString('en-GB').split('/');
        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
        date = time[0] + "-" + date[1] + "-" + date[0];
        time = time[1];
        return date + " " + time;
    }
    if (type === 'yesterdaydate') {
        let today = new Date();
        let require_date = new Date(today);
        require_date.setDate(today.getDate() - 1);
        let date = require_date.toLocaleString('en-GB').split('/');
        let time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
        let yesterdaydate = time[0] + "-" + date[1] + "-" + date[0];
        return yesterdaydate;
    }
    if (type === 'customdate') {

        let today = new Date();
        let requiredate = new Date(today);
        requiredate.setDate(today.getDate() - days);
        let date = requiredate.toLocaleString('en-GB').split('/');
        let time = requiredate.toLocaleString('en-GB').split('/')[2].split(',');
        let require_date = time[0] + "-" + date[1] + "-" + date[0];

        return require_date;
    }


}




// testing reel cron
router.get("/testingreelcron", async (req, res) => {
    try {

        var options = {
            "method": "GET",
            "hostname": "instagram-profile1.p.rapidapi.com",
            "port": null,
            "path": `/getpost/Ce8j3vhB_NZ`,
            "headers": {
                "X-RapidAPI-Key": '29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57',
                "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
                "useQueryString": true
            }
        };

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", async function () {
                const body = Buffer.concat(chunks);
                // console.log(JSON.parse(body.toString()));

                var data = JSON.parse(body.toString());

                if (data.owner) {
                    let reel_page_name = data.owner['username']
                    let reel_view = (data.media['video_views'] ? data.media['video_views'] : null)
                    let reel_play = (data.media['video_play'] ? data.media['video_play'] : null)
                    let reel_like = data.media['like']
                    let reel_comment = data.media['comment_count']
                    let reel_caption = data.media['caption']
                    let reel_date_of_posting = data.media['timestamp']

                    // console.log("reel_page_name: " + reel_page_name)
                    // console.log("reel_play: " + reel_play)
                    // console.log("reel_view: " + reel_view)
                    // console.log("reel_like: " + reel_like)
                    // console.log("reel_comment: " + reel_comment)
                    // console.log("reel_caption: " + reel_caption)
                    // console.log("reel_date_of_posting: " + reel_date_of_posting)
                }


            });
        });

        req.end();
    }
    catch (error) {
        res.status(422).json(error);

    }
});

// testing page cron
router.get("/testingpagecron", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    try {

        // var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4', '135f2bae5emshd67e8f656ba2f6dp14b496jsn3de1837871cc', '744c8b7473msh58517ee93cdb37dp141642jsn8206b7a0fca3']

        // for (let index = 0; index < 30; index++) {

        //     // let api_key = apikey[index % 3]
        //     let api_key = apikey[index % 5]


        var page_username = 'filmygyan'

        var options = {
            "method": "GET",
            "hostname": "instagram-scraper-2022.p.rapidapi.com",
            "port": null,
            "path": `/ig/web_profile_info/?user=${page_username}`,
            "headers": {
                "X-RapidAPI-Key": "29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57",
                "X-RapidAPI-Host": "instagram-scraper-2022.p.rapidapi.com",
                "useQueryString": true
            }
        };
        // var options = {
        //     "method": "GET",
        //     "hostname": "instagram-bulk-profile-scrapper.p.rapidapi.com",
        //     "port": null,
        //     "path": `/clients/api/ig/ig_profile?response_type=full&ig=${page_username}&corsEnabled=true`,
        //     "headers": {
        //         "X-RapidAPI-Key": '29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57',
        //         "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
        //         "useQueryString": true
        //     }
        // };

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", async function () {
                const body = Buffer.concat(chunks);

                var data = JSON.parse(body.toString());
                // console.log(data.data);

                if (data.data) {
                    var result = data.data.user
                    // console.log(result);
                    let page_insta_id = result.id
                    let page_name = result.username
                    let page_type = result.category_name
                    let page_followers = result.edge_followed_by.count
                    let page_following = result.edge_follow.count
                    let page_total_posts = result.edge_owner_to_timeline_media.count
                    let pastMediadata = result.edge_owner_to_timeline_media.edges

                    // console.log("page_insta_id: " + page_insta_id)
                    // console.log("page_name: " + page_name)
                    // console.log("page_type: " + page_type)
                    // console.log("page_followers: " + page_followers)
                    // console.log("page_following: " + page_following)
                    // console.log("page_total_posts: " + page_total_posts)

                    console.log(pastMediadata.length)

                    let countpost = 0;
                    let countvideopost = 0;
                    let totallikes = 0;
                    let totalcomments = 0;
                    let totalviews = 0;

                    let id = 0;
                    let postdata = {};

                    for (var element of pastMediadata) {
                        element = element.node
                        if (!element.pinned_for_users.length) {
                            totallikes += element.edge_liked_by.count
                            totalcomments += element.edge_media_to_comment.count
                            if (element.is_video) {
                                totalviews += element.video_view_count
                                countvideopost = countvideopost + 1
                            }
                            postdata[id] = {
                                ...postdata[id],
                                media_link: element.shortcode,
                                is_video: (element.is_video ? true : false),
                                like: element.edge_liked_by.count,
                                comment_count: element.edge_media_to_comment.count,
                                view_count: (element.video_view_count ? element.video_view_count : null),
                            }
                            id = id + 1;
                            countpost = countpost + 1;
                        }
                    }
                    var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
                    var videoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;
                    // var videoEngagementRate =  (((totalviews / countvideopost) + (totalcomments / countpost)) * 100 ) / page_followers;
                    console.log(postdata)
                    console.log("totalpost: " + countpost)
                    console.log("total video post: " + countvideopost)
                    console.log("LikeEngagementRate: " + LikeEngagementRate)
                    console.log("videoEngagementRate: " + videoEngagementRate)

                    // // response.status(200).json(pastMediadata);
                }


                // // Social Api
                // if (data[0].pk) {
                //     let page_insta_id = data[0].pk
                //     let page_name = data[0].username
                //     let page_type = data[0].category
                //     let page_followers = data[0].follower_count
                //     let page_following = data[0].following_count
                //     let page_total_posts = data[0].media_count
                //     let pastMediadata = data[0].feed.data

                //     // console.log("page_insta_id: " + page_insta_id)
                //     // console.log("page_name: " + page_name)
                //     // console.log("page_type: " + page_type)
                //     // console.log("page_followers: " + page_followers)
                //     // console.log("page_following: " + page_following)
                //     // console.log("page_total_posts: " + page_total_posts)

                //     // console.log(pastMediadata)

                //     let countpost = 0;
                //     let countvideopost = 0;
                //     let totallikes = 0;
                //     let totalcomments = 0;
                //     let totalviews = 0;

                //     let id = 0;
                //     let postdata = {};

                //     for (const element of pastMediadata) {
                //         if (!element.timeline_pinned_user_ids.length) {
                //             totallikes += element.like_count
                //             totalcomments += element.comment_count
                //             if (element.media_type === 2) {
                //                 totalviews += element.view_count
                //                 countvideopost = countvideopost + 1
                //             }
                //             postdata[id] = {
                //                 ...postdata[id],
                //                 media_link: element.code,
                //                 is_video: (element.media_type === 2 ? true : false),
                //                 like: element.like_count,
                //                 comment_count: element.comment_count,
                //                 view_count: (element.view_count ? element.view_count : null),
                //             }
                //             id = id + 1;
                //             countpost = countpost + 1;
                //         }
                //     }
                //     var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
                //     var videoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;
                //     // var videoEngagementRate =  (((totalviews / countvideopost) + (totalcomments / countpost)) * 100 ) / page_followers;
                //     console.log(postdata)
                //     console.log("totalpost: " + countpost)
                //     console.log("total video post: " + countvideopost)
                //     console.log("LikeEngagementRate: " + LikeEngagementRate)
                //     console.log("videoEngagementRate: " + videoEngagementRate)

                //     // response.status(200).json(pastMediadata);
                // }


                response.status(200).json(data);



                // capung GGWP

                // if (data.message) {
                //     // let page_error = data.message
                //     // let page_is_traverse = "2"
                //     // let page_updated_at = (data.media['video_play'] ? data.media['video_play'] : null)

                //     response.status(404).json(data);
                // }
                // else {
                //     let page_insta_id = data.id
                //     let page_name = data.username
                //     let page_type = data.category_name
                //     let page_followers = data.followers
                //     let page_following = data.following
                //     let page_total_posts = data.lastMedia['count']
                //     let pastMediadata = data.lastMedia['media']

                //     console.log("page_insta_id: " + page_insta_id)
                //     console.log("page_name: " + page_name)
                //     console.log("page_type: " + page_type)
                //     console.log("page_followers: " + page_followers)
                //     console.log("page_following: " + page_following)
                //     console.log("page_total_posts: " + page_total_posts)

                //     let countpost = 0;
                //     let countvideopost = 0;
                //     let totallikes = 0;
                //     let totalcomments = 0;
                //     let totalviews = 0;

                //     let id = 0;
                //     let postdata = {};

                //     for (const element of pastMediadata) {
                //         if (!element.is_pinned) {
                //             totallikes += element.like
                //             totalcomments += element.comment_count
                //             if (element.is_video) {
                //                 totalviews += element.video_views
                //                 countvideopost = countvideopost + 1
                //             }
                //             postdata[id] = {
                //                 ...postdata[id],
                //                 media_link: element.link_to_post,
                //                 is_video: element.is_video,
                //                 like: element.like,
                //                 comment_count: element.comment_count,
                //                 view_count: (element.video_views ? element.video_views : null),
                //             }
                //             id = id + 1;
                //             countpost = countpost + 1;
                //         }
                //     }
                //     var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
                //     var videoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;
                //     // var videoEngagementRate =  (((totalviews / countvideopost) + (totalcomments / countpost)) * 100 ) / page_followers;
                //     console.log(postdata)
                //     console.log("totalpost: " + countpost)
                //     console.log("total video post: " + countvideopost)
                //     console.log("LikeEngagementRate: " + LikeEngagementRate)
                //     console.log("videoEngagementRate: " + videoEngagementRate)

                //     response.status(200).json(data);
                // }


            });
        });
        // var options = {
        //     "method": "GET",
        //     "hostname": "instagram-profile1.p.rapidapi.com",
        //     "port": null,
        //     "path": `/getprofile/instantbollywood`,
        //     "headers": {
        //         "X-RapidAPI-Key": '29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57',
        //         "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
        //         "useQueryString": true
        //     }
        // };

        // var req = http.request(options, function (res) {
        //     var chunks = [];

        //     res.on("data", function (chunk) {
        //         chunks.push(chunk);
        //     });

        //     res.on("end", async function () {
        //         const body = Buffer.concat(chunks);

        //         var data = JSON.parse(body.toString());
        //         // console.log(data);

        //         if (data.error) {
        //             // let page_error = data.message
        //             // let page_is_traverse = "2"
        //             // let page_updated_at = (data.media['video_play'] ? data.media['video_play'] : null)

        //             response.status(404).json(data);
        //         }
        //         else {
        //             let page_insta_id = data.id
        //             let page_name = data.username
        //             let page_type = data.category_name
        //             let page_followers = data.followers
        //             let page_following = data.following
        //             let page_total_posts = data.lastMedia['count']
        //             let pastMediadata = data.lastMedia['media']

        //             console.log("page_insta_id: " + page_insta_id)
        //             console.log("page_name: " + page_name)
        //             console.log("page_type: " + page_type)
        //             console.log("page_followers: " + page_followers)
        //             console.log("page_following: " + page_following)
        //             console.log("page_total_posts: " + page_total_posts)

        //             let countpost = 0;
        //             let countvideopost = 0;
        //             let totallikes = 0;
        //             let totalcomments = 0;
        //             let totalviews = 0;

        //             let id = 0;
        //             let postdata = {};

        //             for (const element of pastMediadata) {
        //                 if (!element.is_pinned) {
        //                     totallikes += element.like
        //                     totalcomments += element.comment_count
        //                     if (element.is_video) {
        //                         totalviews += element.video_views
        //                         countvideopost = countvideopost + 1
        //                     }
        //                     postdata[id] = {
        //                         ...postdata[id],
        //                         media_link: element.link_to_post,
        //                         is_video: element.is_video,
        //                         like: element.like,
        //                         comment_count: element.comment_count,
        //                         view_count: (element.video_views ? element.video_views : null),
        //                     }
        //                     id = id + 1;
        //                     countpost = countpost + 1;
        //                 }
        //             }
        //             var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
        //             var videoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;
        //             // var videoEngagementRate =  (((totalviews / countvideopost) + (totalcomments / countpost)) * 100 ) / page_followers;
        //             console.log(postdata)
        //             console.log("totalpost: " + countpost)
        //             console.log("total video post: " + countvideopost)
        //             console.log("LikeEngagementRate: " + LikeEngagementRate)
        //             console.log("videoEngagementRate: " + videoEngagementRate)

        //             response.status(200).json(data);
        //         }


        //     });
        // });

        req.end();
        //     await sleep(2000);

        // }

        // console.log("complete");
        // response.status(201).json("test cronPageApi hit successfull");
    }
    catch (error) {
        response.status(422).json(error);

    }
});


//get cron Reel Api
router.get("/cronReelApi", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {

        let todaydate = datetime('currentdate');

        let yesterday_date = datetime('yesterdaydate')
        var crondata = {};
        if (todaydate) {
            crondata = await cron.findOne({ cron_traverse_status: '0', cron_created_at: todaydate });
            if (!crondata) {
                const cron_total_links = await reel.find({ reel_created_at: { '$regex': yesterday_date } }).count();
                if (cron_total_links) {
                    var cron_limit_set = Math.round(parseInt(cron_total_links) / 4);
                    const crondatacount = (await cron.findOne().sort({ _id: -1 }).limit(1));
                    const cron_id = (crondatacount != null) ? parseInt(crondatacount["cron_id"]) + 1 : "1";  //cron id auto imcrement
                    const cron_created_at = todaydate;
                    const cron_traverse_status = 0;

                    const addCron = new cron({
                        cron_id, cron_total_links, cron_limit_set, cron_traverse_status, cron_created_at
                    });

                    await addCron.save();
                    crondata = addCron
                }
                else {
                    response.status(422).json(error)
                }
            }
        }

        // to get date one day previous
        let date_needed = datetime('yesterdaydate')

        if (date_needed && crondata) {
            var cron_limit_set = crondata.cron_limit_set;

            const reeldata = await reel.find({ reel_is_traverse: '0', reel_created_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(cron_limit_set);
            console.log(reeldata.length);

            var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4']

            for (let index = 0; index < reeldata.length; index++) {

                let api_key = apikey[index % 3]

                let reellink = reeldata[index];

                if (reellink.reel_link.split("/")[4]) {

                    let reel_shortcode = reellink.reel_link.split("/")[4]

                    var currentdatetime = datetime('currentdatetime')

                    let reel_link = reellink.reel_link;
                    let project_id = reellink.project_id;
                    let reel_is_traverse = "0";
                    let reel_created_at = currentdatetime;

                    // db.coll_reels_2.find().sort({_id:-1}).limit(1)

                    var reeldatacount = await reel.find().sort({ _id: -1 }).limit(1);
                    let reel_id = (reeldatacount != null) ? parseInt(reeldatacount[0]["reel_id"]) + 1 : "1";  //reel id auto imcrement


                    if (reel_link && project_id && reel_created_at) {
                        let addReel = new reel({
                            reel_id, reel_link, project_id, reel_is_traverse, reel_created_at
                        });
                        await addReel.save();
                    }

                    var options = {
                        "method": "GET",
                        "hostname": "instagram-profile1.p.rapidapi.com",
                        "port": null,
                        "path": `/getpost/${reel_shortcode}`,
                        "headers": {
                            "X-RapidAPI-Key": api_key,
                            "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
                            "useQueryString": true
                        }
                    };

                    var req = http.request(options, function (res) {
                        var chunks = [];

                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on("end", async function () {
                            const body = Buffer.concat(chunks);
                            // console.log(JSON.parse(body.toString()));

                            var data = JSON.parse(body.toString());

                            if (data.message) {
                                let reel_error = data.message
                                let reel_is_traverse = "2"
                                let reel_updated_at = currentdatetime

                                var id = reellink._id;

                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });
                            }
                            else if (data.owner) {
                                let reel_page_name = data.owner['username']
                                let reel_view = (data.media['video_views'] ? data.media['video_views'] : null)
                                let reel_play = (data.media['video_play'] ? data.media['video_play'] : null)
                                let reel_like = data.media['like']
                                let reel_comment = data.media['comment_count']
                                let reel_caption = data.media['caption']
                                let reel_date_of_posting = data.media['timestamp']
                                let reel_is_traverse = "1"

                                let reel_updated_at = currentdatetime

                                var id = reellink._id;
                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_page_name: reel_page_name, reel_view: reel_view, reel_play: reel_play, reel_like: reel_like, reel_comment: reel_comment, reel_caption: reel_caption, reel_date_of_posting: reel_date_of_posting, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });

                            }


                        });
                    });

                    req.end();
                    await sleep(1500);

                }

                else {
                    let reel_error = "link is not correct"
                    let reel_is_traverse = "-1"

                    var currentdatetime = datetime('currentdatetime')

                    let reel_updated_at = currentdatetime

                    var id = reellink._id;

                    // console.log(id)
                    await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                        new: true
                    });
                }

            }

            console.log("complete");
            response.status(201).json("cronReelApi hit successfull");

        }
        else {
            response.status(422).json(error)
        }
    }
    catch (error) {
        response.status(422).json(error)
    }
});


//get cron Reel Traverse 
router.get("/cronReelTraverse", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {

        let todaydate = datetime('currentdate');

        var crondata = {};
        if (todaydate) {
            crondata = await cron.findOne({ cron_traverse_status: '2', cron_created_at: todaydate });
            if (!crondata) {
                const cron_total_links = await reel.find({ reel_is_traverse: '2', reel_updated_at: { '$regex': todaydate } }).count();
                if (cron_total_links) {
                    var cron_limit_set = Math.round(parseInt(cron_total_links) / 2);
                    const crondatacount = (await cron.findOne().sort({ _id: -1 }).limit(1));
                    const cron_id = (crondatacount != null) ? parseInt(crondatacount["cron_id"]) + 1 : "1";  //cron id auto imcrement
                    const cron_created_at = todaydate;
                    const cron_traverse_status = 2;

                    const addCron = new cron({
                        cron_id, cron_total_links, cron_limit_set, cron_traverse_status, cron_created_at
                    });

                    await addCron.save();
                    crondata = addCron
                }
                else {
                    response.status(422).json(error)
                }
            }
        }


        // to get date one day previous
        let date_needed = todaydate;

        if (date_needed && crondata) {
            var cron_limit_set = crondata.cron_limit_set;

            const reeldata = await reel.find({ reel_is_traverse: '2', reel_updated_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(cron_limit_set);
            console.log(reeldata.length);

            var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4']

            for (let index = 0; index < reeldata.length; index++) {

                let api_key = apikey[index % 3]

                let reellink = reeldata[index];

                if (reellink.reel_link.split("/")[4]) {

                    let reel_shortcode = reellink.reel_link.split("/")[4]

                    var currentdatetime = datetime('currentdatetime')

                    var options = {
                        "method": "GET",
                        "hostname": "instagram-profile1.p.rapidapi.com",
                        "port": null,
                        "path": `/getpost/${reel_shortcode}`,
                        "headers": {
                            "X-RapidAPI-Key": api_key,
                            "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
                            "useQueryString": true
                        }

                    };

                    var req = http.request(options, function (res) {
                        var chunks = [];

                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on("end", async function () {
                            const body = Buffer.concat(chunks);
                            // console.log(JSON.parse(body.toString()));

                            var data = JSON.parse(body.toString());

                            if (data.message) {
                                let reel_error = data.message
                                let reel_is_traverse = "3"
                                let reel_updated_at = currentdatetime

                                var id = reellink._id;

                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });
                            }
                            else if (data.owner) {
                                let reel_page_name = data.owner['username']
                                let reel_view = (data.media['video_views'] ? data.media['video_views'] : null)
                                let reel_play = (data.media['video_play'] ? data.media['video_play'] : null)
                                let reel_like = data.media['like']
                                let reel_comment = data.media['comment_count']
                                let reel_caption = data.media['caption']
                                let reel_date_of_posting = data.media['timestamp']
                                let reel_is_traverse = "1"

                                let reel_updated_at = currentdatetime

                                var id = reellink._id;
                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_page_name: reel_page_name, reel_view: reel_view, reel_play: reel_play, reel_like: reel_like, reel_comment: reel_comment, reel_caption: reel_caption, reel_date_of_posting: reel_date_of_posting, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });

                            }


                        });
                    });

                    req.end();
                    await sleep(1000);

                }

                else {
                    let reel_error = "link is not correct"
                    let reel_is_traverse = "-1"

                    var currentdatetime = datetime('currentdatetime')

                    let reel_updated_at = currentdatetime

                    var id = reellink._id;

                    // console.log(id)
                    await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                        new: true
                    });
                }

            }

            console.log("complete");
            response.status(201).json("cronReelTraverse hit successfull");

        }
        else {
            response.status(422).json(error)
        }
    }
    catch (error) {
        response.status(422).json(error)
    }
});





//get cron Reel Retry
router.get("/cronReelRetry", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {

        let date_needed = datetime('currentdate');

        if (date_needed) {

            const reeldata = await reel.find({ reel_is_traverse: '3', reel_updated_at: { '$regex': date_needed } }, { reel_link: 1, _id: 1, project_id: 1 }).sort({ reel_id: 1 }).collation({ locale: "en_US", numericOrdering: true });
            console.log(reeldata.length);

            var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4']

            for (let index = 0; index < reeldata.length; index++) {

                let api_key = apikey[index % 3]

                let reellink = reeldata[index];

                if (reellink.reel_link.split("/")[4]) {

                    let reel_shortcode = reellink.reel_link.split("/")[4]

                    var currentdatetime = datetime('currentdatetime')

                    var options = {
                        "method": "GET",
                        "hostname": "instagram-profile1.p.rapidapi.com",
                        "port": null,
                        "path": `/getpost/${reel_shortcode}`,
                        "headers": {
                            "X-RapidAPI-Key": api_key,
                            "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
                            "useQueryString": true
                        }
                    };

                    var req = http.request(options, function (res) {
                        var chunks = [];

                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on("end", async function () {
                            const body = Buffer.concat(chunks);
                            // console.log(JSON.parse(body.toString()));

                            var data = JSON.parse(body.toString());

                            if (data.message) {
                                let reel_error = data.message
                                let reel_is_traverse = "3"
                                let reel_updated_at = currentdatetime

                                var id = reellink._id;

                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });
                            }
                            else if (data.owner) {
                                let reel_page_name = data.owner['username']
                                let reel_view = (data.media['video_views'] ? data.media['video_views'] : null)
                                let reel_play = (data.media['video_play'] ? data.media['video_play'] : null)
                                let reel_like = data.media['like']
                                let reel_comment = data.media['comment_count']
                                let reel_caption = data.media['caption']
                                let reel_date_of_posting = data.media['timestamp']
                                let reel_is_traverse = "1"

                                let reel_updated_at = currentdatetime

                                var id = reellink._id;
                                // console.log(id)
                                await reel.findByIdAndUpdate(id, { $set: { reel_page_name: reel_page_name, reel_view: reel_view, reel_play: reel_play, reel_like: reel_like, reel_comment: reel_comment, reel_caption: reel_caption, reel_date_of_posting: reel_date_of_posting, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                                    new: true
                                });

                            }


                        });
                    });

                    req.end();
                    await sleep(1500);

                }

                else {
                    let reel_error = "link is not correct"
                    let reel_is_traverse = "-1"

                    var currentdatetime = datetime('currentdatetime')

                    let reel_updated_at = currentdatetime

                    var id = reellink._id;

                    // console.log(id)
                    await reel.findByIdAndUpdate(id, { $set: { reel_error: reel_error, reel_is_traverse: reel_is_traverse, reel_updated_at: reel_updated_at } }, {
                        new: true
                    });
                }

            }

            console.log("complete");
            response.status(201).json("cronReelRetry hit successfull");

        }
        else {
            response.status(422).json(error)
        }
    }
    catch (error) {
        response.status(422).json(error)
    }
});




//get cron page api 
router.get("/cronPageApi", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {

        const pagedata = await page.find({ page_is_traverse: '0' }, { page_link: 1, _id: 1, batch_id: 1 }).sort({ page_id: 1 }).collation({ locale: "en_US", numericOrdering: true });
        console.log(pagedata.length);

        // var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4']

        var apikey = ['29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57', '98313acb74mshb662220473bc42bp11c728jsn1d8abc671b3b', 'c6cf21ca34msh526fcb983fa64bap1cb2dajsnb3f1993739d4', '135f2bae5emshd67e8f656ba2f6dp14b496jsn3de1837871cc', '744c8b7473msh58517ee93cdb37dp141642jsn8206b7a0fca3']

        for (let index = 0; index < pagedata.length; index++) {

            // let api_key = apikey[index % 3]
            let api_key = apikey[index % 5]

            let pagelink = pagedata[index];

            var page_link_info = pagelink.page_link.split("/")[3]

            if (page_link_info) {

                let page_username = page_link_info.split('?')[0];
                console.log(page_username)

                var currentdatetime = datetime('currentdatetime')

                // var options = {
                //     "method": "GET",
                //     "hostname": "instagram-profile1.p.rapidapi.com",
                //     "port": null,
                //     "path": `/getprofileinfo/${page_username}`,
                //     "headers": {
                //         "X-RapidAPI-Key": api_key,
                //         "X-RapidAPI-Host": "instagram-profile1.p.rapidapi.com",
                //         "useQueryString": true
                //     }

                // };

                var options = {
                    "method": "GET",
                    "hostname": "instagram-scraper-2022.p.rapidapi.com",
                    "port": null,
                    "path": `/ig/web_profile_info/?user=${page_username}`,
                    "headers": {
                        "X-RapidAPI-Key": api_key,
                        "X-RapidAPI-Host": "instagram-scraper-2022.p.rapidapi.com",
                        "useQueryString": true
                    }
                };

                var req = http.request(options, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", async function () {
                        const body = Buffer.concat(chunks);
                        // console.log(JSON.parse(body.toString()));

                        var data = JSON.parse(body.toString());

                        if (data.message) {
                            let page_error = data.message
                            let page_is_traverse = "2"
                            let page_updated_at = currentdatetime

                            var id = pagelink._id;

                            // console.log(id)
                            await page.findByIdAndUpdate(id, { $set: { page_error: page_error, page_is_traverse: page_is_traverse, page_updated_at: page_updated_at } }, {
                                new: true
                            });
                        }

                        else {

                            var result = data.data.user
                            let page_insta_id = result.id
                            let page_name = result.username
                            let page_type = result.category_name
                            let page_followers = result.edge_followed_by.count
                            let page_following = result.edge_follow.count
                            let page_total_posts = result.edge_owner_to_timeline_media.count
                            let pastMediadata = result.edge_owner_to_timeline_media.edges

                            let countpost = 0;
                            let countvideopost = 0;
                            let totallikes = 0;
                            let totalcomments = 0;
                            let totalviews = 0;

                            let index = 0;
                            let postdata = {};

                            for (var element of pastMediadata) {
                                element = element.node
                                if (!element.pinned_for_users.length) {
                                    totallikes += element.edge_liked_by.count
                                    totalcomments += element.edge_media_to_comment.count
                                    if (element.is_video) {
                                        totalviews += element.video_view_count
                                        countvideopost = countvideopost + 1
                                    }
                                    postdata[index] = {
                                        ...postdata[index],
                                        media_link: element.shortcode,
                                        is_video: (element.is_video ? true : false),
                                        like: element.edge_liked_by.count,
                                        comment_count: element.edge_media_to_comment.count,
                                        view_count: (element.video_view_count ? element.video_view_count : null),
                                    }
                                    index = index + 1;
                                    countpost = countpost + 1;
                                }
                            }
                            var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
                            var VideoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;


                            let page_like_engagement = (LikeEngagementRate ? LikeEngagementRate : null)
                            let page_video_engagement = (VideoEngagementRate ? VideoEngagementRate : null)
                            let page_past_post_data = postdata;


                            let page_is_traverse = "1"

                            let page_updated_at = currentdatetime

                            var id = pagelink._id;
                            // console.log(id)
                            await page.findByIdAndUpdate(id, { $set: { page_insta_id: page_insta_id, page_name: page_name, page_type: page_type, page_followers: page_followers, page_following: page_following, page_total_posts: page_total_posts, page_like_engagement: page_like_engagement, page_video_engagement: page_video_engagement, page_past_post_data: page_past_post_data, page_is_traverse: page_is_traverse, page_updated_at: page_updated_at } }, {
                                new: true
                            });
                        }


                        // if (!data.id || data.error) {
                        //     let page_error = data.message
                        //     let page_is_traverse = "2"
                        //     let page_updated_at = currentdatetime

                        //     var id = pagelink._id;

                        //     // console.log(id)
                        //     await page.findByIdAndUpdate(id, { $set: { page_error: page_error, page_is_traverse: page_is_traverse, page_updated_at: page_updated_at } }, {
                        //         new: true
                        //     });
                        // }

                        // else {
                        //     let page_insta_id = data.id
                        //     let page_name = data.username
                        //     let page_type = data.category_name
                        //     let page_followers = data.followers
                        //     let page_following = data.following
                        //     let page_total_posts = data.lastMedia['count']
                        //     let pastMediadata = data.lastMedia['media']


                        //     let countpost = 0;
                        //     let countvideopost = 0;
                        //     let totallikes = 0;
                        //     let totalcomments = 0;
                        //     let totalviews = 0;

                        //     let index = 0;
                        //     let postdata = {};

                        //     for (const element of pastMediadata) {
                        //         if (!element.is_pinned) {
                        //             totallikes += element.like
                        //             totalcomments += element.comment_count
                        //             if (element.is_video) {
                        //                 totalviews += element.video_views
                        //                 countvideopost = countvideopost + 1
                        //             }
                        //             postdata[index] = {
                        //                 ...postdata[index],
                        //                 media_link: element.link_to_post,
                        //                 is_video: element.is_video,
                        //                 like: element.like,
                        //                 comment_count: element.comment_count,
                        //                 view_count: (element.video_views ? element.video_views : null),
                        //             }
                        //             index = index + 1;
                        //             countpost = countpost + 1;
                        //         }
                        //     }
                        //     var LikeEngagementRate = (((totallikes + totalcomments) / countpost) * 100) / page_followers;
                        //     var VideoEngagementRate = ((totalviews / countvideopost) * 100) / page_followers;


                        //     let page_like_engagement = (LikeEngagementRate ? LikeEngagementRate : null)
                        //     let page_video_engagement = (VideoEngagementRate ? VideoEngagementRate : null)
                        //     let page_past_post_data = postdata;


                        //     let page_is_traverse = "1"

                        //     let page_updated_at = currentdatetime

                        //     var id = pagelink._id;
                        //     // console.log(id)
                        //     await page.findByIdAndUpdate(id, { $set: { page_insta_id: page_insta_id, page_name: page_name, page_type: page_type, page_followers: page_followers, page_following: page_following, page_total_posts: page_total_posts, page_like_engagement: page_like_engagement, page_video_engagement: page_video_engagement, page_past_post_data: page_past_post_data, page_is_traverse: page_is_traverse, page_updated_at: page_updated_at } }, {
                        //         new: true
                        //     });
                        // }

                    });
                });

                req.end();
                await sleep(3000);

            }

            else {
                let page_error = "link is not correct"
                let page_is_traverse = "-1"

                var currentdatetime = datetime('currentdatetime')

                let page_updated_at = currentdatetime

                var id = pagelink._id;

                // console.log(id)
                await page.findByIdAndUpdate(id, { $set: { page_error: page_error, page_is_traverse: page_is_traverse, page_updated_at: page_updated_at } }, {
                    new: true
                });
            }

        }

        console.log("complete");
        response.status(201).json("cronPageApi hit successfull");

    }
    catch (error) {
        response.status(422).json(error)
    }
});



//get cron Youtube video Api
router.get("/cronYoutubeVideoApi", async (request, response) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {

        // to get date one day previous
        // let date_needed = datetime('currentdate');

        let date_needed = datetime('yesterdaydate')

        if (date_needed) {

            const youtubedata = await youtube.find({ link_is_traverse: '0', link_created_at: { '$regex': date_needed } }, { video_link: 1, _id: 1, campaign_id: 1 }).sort({ video_id: 1 }).collation({ locale: "en_US", numericOrdering: true });
            console.log(youtubedata.length);

            for (let index = 0; index < youtubedata.length; index++) {

                let videolink = youtubedata[index];

                var id = videolink._id;

                var currentdatetime = datetime('currentdatetime')

                var link_info = YoutubeUrl(videolink.video_link);


                if (!link_info) {

                    let link_error = "link is not correct"
                    let link_is_traverse = "-1"
                    let link_updated_at = currentdatetime

                    await youtube.findByIdAndUpdate(id, { $set: { link_error: link_error, link_is_traverse: link_is_traverse, link_updated_at: link_updated_at } }, {
                        new: true
                    });
                }
                else if (!(link_info.type === 'video' || link_info.type === 'shorts')) {

                    let link_error = "This is not a Youtube Shorts Or Video Link"
                    let link_is_traverse = "-1"
                    let link_updated_at = currentdatetime

                    await youtube.findByIdAndUpdate(id, { $set: { link_error: link_error, link_is_traverse: link_is_traverse, link_updated_at: link_updated_at } }, {
                        new: true
                    });
                }

                else {

                    var video_details = ((await youtubevideodetails(link_info.data)).length > 0 ? (await youtubevideodetails(link_info.data))[0] : null);

                    let video_link = videolink.video_link;
                    let campaign_id = videolink.campaign_id;
                    let link_is_traverse = "0";
                    let link_created_at = currentdatetime;

                    var videodatacount = await youtube.find().sort({ _id: -1 }).limit(1);
                    let video_id = (videodatacount != null) ? parseInt(videodatacount[0]["video_id"]) + 1 : "1";  //video id auto imcrement

                    if (video_link && campaign_id && link_created_at) {
                        let addlink = new youtube({
                            video_id, video_link, campaign_id, link_is_traverse, link_created_at
                        });
                        await addlink.save();
                    }


                    if (!video_details) {

                        let link_error = "Some Error in Api or mAy be link is not correct."
                        let link_is_traverse = "2"
                        let link_updated_at = currentdatetime

                        await youtube.findByIdAndUpdate(id, { $set: { link_error: link_error, link_is_traverse: link_is_traverse, link_updated_at: link_updated_at } }, {
                            new: true
                        });
                    }
                    else {
                        let video_channel_id = video_details.snippet.channelId
                        let video_channel_name = video_details.snippet.channelTitle
                        let video_view = (video_details.statistics.viewCount ? video_details.statistics.viewCount : null)
                        let video_like = (video_details.statistics.likeCount ? video_details.statistics.likeCount : null)
                        let video_comment = (video_details.statistics.commentCount ? video_details.statistics.commentCount : null)
                        let video_title = video_details.snippet.title
                        let video_date_of_posting = video_details.snippet.publishedAt
                        let link_is_traverse = "1"

                        let link_updated_at = currentdatetime

                        await youtube.findByIdAndUpdate(id, { $set: { video_channel_id: video_channel_id, video_channel_name: video_channel_name, video_view: video_view, video_like: video_like, video_comment: video_comment, video_title: video_title, video_date_of_posting: video_date_of_posting, link_is_traverse: link_is_traverse, link_updated_at: link_updated_at } }, {
                            new: true
                        });
                    }

                    await sleep(1000);
                }

            }

            console.log("complete");
            response.status(201).json("cronYoutubeVideoApi hit successfull");

        }
        else {
            response.status(422).json(error)
        }
    }
    catch (error) {
        response.status(422).json(error)
    }
});


router.get("/SendEmail", async (request, response) => {

    try {
        var nodemailer = require("nodemailer");
        var sender = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: "aryan.mehta524@gmail.com",
                pass: `mcddhbbstsguuisc`
            }
        });

        var mail = {
            from: "aryan.mehta524@gmail.com",
            to: "ikbirsingh97@gmail.com",
            subject: "Sending Email using Node.js",
            text: "That was easy!"
        };

        sender.sendMail(mail, function (error, info) {
            if (error) {
                console.log(error);
                response.status(422).json(error);

            } else {
                console.log("Email sent successfully: "
                    + info.response);
                response.status(201).json("Success");
            }

        });

    }
    catch (error) {
        response.status(422).json(error)
    }
});




const { google } = require("googleapis");
// var readline = require('readline');
// var OAuth2 = google.auth.OAuth2;
// const apiKey = 'AIzaSyDHXHwcoM9lIi62Fejv4EhhyhTJ7Cvueis';
// const apiKey = 'AIzaSyDV-VVpbB1mTQFmypTz3lO0QcDINOreeyc';
// const youtube = google.youtube({
//     version: "v3",
//     auth: apiKey,
// });

const youtubevideodetails = async (videoid) => {
    if (!videoid) {
        return;
    }

    const api_key = 'AIzaSyDV-VVpbB1mTQFmypTz3lO0QcDINOreeyc';

    // const { google } = require("googleapis");
    const youtube = google.youtube({
        version: "v3",
        auth: api_key,
    });

    const result = await youtube.videos.list({
        part: "snippet,statistics",
        id: videoid,
    });

    // console.log(result)

    const titles = result.data.items;
    return titles;
}

const getAccessToken = async (username) => {

    // let refreshToken = '1//0gQ7Ej0g9KfmUCgYIARAAGBASNwF-L9Ir4iQTMQLjJsJ3arzTxHgQpEMM-5dtYhygth-2zKxhuA7-AkGZYLdQe6gmKSBm9MdCK2w';

    // const clientSecret = require('../models/googleauth/client_secret_611814030717-r8q6rvpugrfc04l4424s94coi0fnu63f.apps.googleusercontent.com.json');
    // const { client_id, client_secret, redirect_uris } = clientSecret.installed;
    // const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // // Generate the authorization URL
    // const authUrl = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: ['https://www.googleapis.com/auth/youtube.readonly']
    // });

    // console.log('Authorize this app by visiting this url:', authUrl);
    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });
    // rl.question('Enter the code from that page here: ', (code) => {
    //     rl.close();

    //     // Get the access token
    //     oauth2Client.getToken(code, (err, token) => {
    //         if (err) return console.error('Error retrieving access token', err);
    //         console.log('Access token:', token);
    //         refreshToken = token.refresh_token;
    //     });
    // });

    // return refreshToken;



    // var fs = require('fs');
    // var readline = require('readline');
    // var {google} = require('googleapis');
    // var OAuth2 = google.auth.OAuth2;

    // // If modifying these scopes, delete your previously saved credentials
    // // at ~/.credentials/youtube-nodejs-quickstart.json
    // var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
    // var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    //     process.env.USERPROFILE) + '/.credentials/';
    // var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

    // // Load client secrets from a local file.
    // fs.readFile('../server/models/googleauth/client_secret_611814030717-r8q6rvpugrfc04l4424s94coi0fnu63f.apps.googleusercontent.com.json', function processClientSecrets(err, content) {
    //   if (err) {
    //     console.log('Error loading client secret file: ' + err);
    //     return;
    //   }
    //   // Authorize a client with the loaded credentials, then call the YouTube API.
    //   authorize(JSON.parse(content), getChannel);
    // });

    // /**
    //  * Create an OAuth2 client with the given credentials, and then execute the
    //  * given callback function.
    //  *
    //  * @param {Object} credentials The authorization client credentials.
    //  * @param {function} callback The callback to call with the authorized client.
    //  */
    // function authorize(credentials, callback) {
    //   var clientSecret = credentials.installed.client_secret;
    //   var clientId = credentials.installed.client_id;
    //   var redirectUrl = credentials.installed.redirect_uris[0];
    //   var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    //   // Check if we have previously stored a token.
    //   fs.readFile(TOKEN_PATH, function(err, token) {
    //     if (err) {
    //       getNewToken(oauth2Client, callback);
    //     } else {
    //       oauth2Client.credentials = JSON.parse(token);
    //       callback(oauth2Client);
    //     }
    //   });
    // }

    // /**
    //  * Get and store new token after prompting for user authorization, and then
    //  * execute the given callback with the authorized OAuth2 client.
    //  *
    //  * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
    //  * @param {getEventsCallback} callback The callback to call with the authorized
    //  *     client.
    //  */
    // function getNewToken(oauth2Client, callback) {
    //   var authUrl = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES
    //   });
    //   console.log('Authorize this app by visiting this url: ', authUrl);
    //   var rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    //   });
    //   rl.question('Enter the code from that page here: ', function(code) {
    //     rl.close();
    //     oauth2Client.getToken(code, function(err, token) {
    //       if (err) {
    //         console.log('Error while trying to retrieve access token', err);
    //         return;
    //       }
    //       oauth2Client.credentials = token;
    //       storeToken(token);
    //       callback(oauth2Client);
    //     });
    //   });
    // }

    // /**
    //  * Store token to disk be used in later program executions.
    //  *
    //  * @param {Object} token The token to store to disk.
    //  */
    // function storeToken(token) {
    //   try {
    //     fs.mkdirSync(TOKEN_DIR);
    //   } catch (err) {
    //     if (err.code != 'EEXIST') {
    //       throw err;
    //     }
    //   }
    //   fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    //     if (err) throw err;
    //     console.log('Token stored to ' + TOKEN_PATH);
    //   });
    // }

    // /**
    //  * Lists the names and IDs of up to 10 files.
    //  *
    //  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
    //  */
    // function getChannel(auth) {
    //   var service = google.youtube('v3');
    //   service.channels.list({
    //     auth: auth,
    //     part: 'snippet,contentDetails,statistics',
    //     forUsername: 'GoogleDevelopers'
    //   }, function(err, response) {
    //     if (err) {
    //       console.log('The API returned an error: ' + err);
    //       return;
    //     }
    //     var channels = response.data.items;
    //     if (channels.length == 0) {
    //       console.log('No channel found.');
    //     } else {
    //       console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
    //                   'it has %s views.',
    //                   channels[0].id,
    //                   channels[0].snippet.title,
    //                   channels[0].statistics.viewCount);
    //     }
    //   });
    // }



    const clientSecret = require('../models/googleauth/client_secret_611814030717-r8q6rvpugrfc04l4424s94coi0fnu63f.apps.googleusercontent.com.json');
    const { client_id, client_secret, redirect_uris } = clientSecret.installed;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube']
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();

        // Get the access token
        oauth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            console.log('Access token:', token);
            let refreshToken = token.refresh_token;
            //   let accessToken = token.access_token;
            getChannelEngagementRate(username, refreshToken)
        });
    });
}



const getChannelEngagementRate = async (username) => {
    if (!username) {
        return;
    }

    // const { google } = require('googleapis');

    // const apiKey = 'AIzaSyDV-VVpbB1mTQFmypTz3lO0QcDINOreeyc';


    //   const client = new google.auth.APIKeyAuth({ apiKey, scopes: ['https://www.googleapis.com/auth/youtube.readonly'] });
    //   const youtube = google.youtube({ version: 'v3', auth: client });
    //   const response = await youtube.channels.list({ part: 'statistics', forUsername: username });
    //   const { likes, comments, viewCount } = response.data.items[0].statistics;
    //   return (likes + comments) / viewCount * 100;

    //     const clientSecret = require('../models/googleauth/client_secret_611814030717-r8q6rvpugrfc04l4424s94coi0fnu63f.apps.googleusercontent.com.json');
    //     const { client_id, client_secret } = clientSecret.installed;
    //   const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
    //   console.log(oauth2Client)
    //   const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    //   const response = await youtube.channels.list({ part: 'statistics', forUsername: username });
    //   const { likes, comments, viewCount } = response.data.items[0].statistics;
    //   return (likes + comments) / viewCount * 100;


    // let refreshToken = '1//0gORaeRjhllCHCgYIARAAGBASNwF-L9IrAIcH1xyJ0iQF-vioWvbr0y6Fi_btwtW_dHnWo-B5Qa_qh8GrJ7VKynXX0bomDDr_jGk';
    // if (refreshToken) {
    //     const oauth2Client = new google.auth.OAuth2();
    //     // oauth2Client.setCredentials({ refresh_token: refreshToken });
    //     oauth2Client.setCredentials({
    //         refresh_token: refreshToken
    //     });
    //     // const accessToken = await oauth2Client.getAccessToken();
    //     // const oauth2Client = new google.auth.OAuth2();
    //     // oauth2Client.setCredentials({ access_token: accessToken });
    //     const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.channels.list({ part: 'statistics', forUsername: username });
    console.log(response.data.items);
    // }
    // const oauth2Client = new google.auth.OAuth2();
    // oauth2Client.setCredentials({ refresh_token: refreshToken });
    // const accessToken = await oauth2Client.getAccessToken();
    // const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    // const response = await youtube.channels.list({ part: 'statistics', forUsername: username });
    // console.log(response);
    // const { likes, comments, viewCount } = response.data.items[0].statistics;
    // console.log(`Engagement rate: ${(likes + comments) / viewCount * 100}%`);
    // return (likes + comments) / viewCount * 100;


    // const options = {
    //     hostname: 'www.googleapis.com',
    //     path: `/youtube/v3/channels?part=statistics&forUsername=${username}&key=${apiKey}`,
    //     method: 'GET'
    //   };

    //   const req = http.request(options, (res) => {
    //     let data = '';
    //     res.on('data', (chunk) => {
    //       data += chunk;
    //     });
    //     res.on('end', () => {
    //       const response = JSON.parse(data);
    //     //   const { likeCount, commentCount, viewCount } = response.items[0].statistics;
    //       console.log(response);
    //     //   console.log(`Comment count: ${commentCount}`);
    //     //   console.log(`Engagement rate: ${(parseInt(likeCount) + parseInt(commentCount)) / parseInt(viewCount) * 100}%`);
    //     });
    //   });

    //   req.on('error', (error) => {
    //     console.error(error);
    //   });

    //   req.end();


    //   const options = {
    //     hostname: 'www.googleapis.com',
    //     path: `/youtube/v3/channels?part=statistics&id=UCpEhnqL0y41EpW2TvWAHD7Q&key=${apiKey}`,
    //     method: 'GET'
    //   };

    //   const req = http.request(options, (res) => {
    //     let data = '';
    //     res.on('data', (chunk) => {
    //       data += chunk;
    //     });
    //     res.on('end', () => {
    //       const response = JSON.parse(data);
    //       console.log("response")
    //     //   const { likeCount, commentCount, viewCount } = response.items[0].statistics;
    //     //   console.log(`Like count: ${likeCount}`);
    //     //   console.log(`Comment count: ${commentCount}`);
    //     //   console.log(`Engagement rate: ${(parseInt(likeCount) + parseInt(commentCount)) / parseInt(viewCount) * 100}%`);
    //     });
    //   });

    //   req.on('error', (error) => {
    //     console.error(error);
    //   });

}

// const getAccessTokenforupload = async () => {
//     // const clientSecret = require('../models/googleauth/client_secret_611814030717-r8q6rvpugrfc04l4424s94coi0fnu63f.apps.googleusercontent.com.json');
//     // const { client_id, client_secret, redirect_uris } = clientSecret.installed;
//     // const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//     // // Generate the authorization URL
//     // const authUrl = oauth2Client.generateAuthUrl({
//     //     access_type: 'offline',
//     //     scope: ['https://www.googleapis.com/auth/youtube']
//     // });

//     // console.log('Authorize this app by visiting this url:', authUrl);
//     // const rl = readline.createInterface({
//     //     input: process.stdin,
//     //     output: process.stdout
//     // });
//     // rl.question('Enter the code from that page here: ', (code) => {
//     //     rl.close();

//     //     // Get the access token
//     //     oauth2Client.getToken(code, (err, token) => {
//     //         if (err) return console.error('Error retrieving access token', err);
//     //         console.log('Access token:', token);
//     //         // let refreshToken = token.refresh_token;
//     //         let accessToken = token.access_token;
//     //         uploadvideo(accessToken)
//     //     });
//     // });
// }

const getAccessTokenforupload = async () => {

    // If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
    const TOKEN_PATH = '../' + 'client_oauth_token.json';

    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}



const uploadvideo = async (accessToken) => {
    // // Define the video resource
    // const video = {
    //     snippet: {
    //         title: "My Video",
    //         description: "A video I made",
    //         tags: ["tag1", "tag2", "tag3"],
    //         categoryId: 22
    //     },
    //     status: {
    //         privacyStatus: "public"
    //     }
    // };

    // // Define the file to upload
    // const fileSize = fs.statSync('../server/models/youtubeVideos/2023_01_09_1673249720.mp4').size;
    // const media = {
    //     body: fs.createReadStream('../server/models/youtubeVideos/2023_01_09_1673249720.mp4')
    // };

    // // Insert the video

    // const oauth2Client = new google.auth.OAuth2();
    // oauth2Client.setCredentials({ access_token: accessToken });
    // const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    // const res = await youtube.videos.insert(
    //     {
    //         part: "id,snippet,status",
    //         resource: video,
    //         media,
    //         maxContentLength: fileSize,
    //         maxMediaSize: fileSize
    //     },
    //     {
    //         onUploadProgress: evt => {
    //             const progress = (evt.bytesRead / fileSize) * 100;
    //             console.log(`Uploaded ${progress}%`);
    //         }
    //     }
    // );

    // console.log(res);

    // //   console.log(`Video ID: ${res.data.id}`);



    //new code
    const videoFilePath = '../vid.mp4'
    const thumbFilePath = '../thumb.png'

    // video category IDs for YouTube:
    const categoryIds = {
        Entertainment: 24,
        Education: 27,
        ScienceTechnology: 28
    }


    const service = google.youtube('v3')

    service.videos.insert({
        auth: auth,
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title,
                description,
                tags,
                categoryId: categoryIds.ScienceTechnology,
                defaultLanguage: 'en',
                defaultAudioLanguage: 'en'
            },
            status: {
                privacyStatus: "private"
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath),
        },
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response.data)

        console.log('Video uploaded. Uploading the thumbnail now.')
        service.thumbnails.set({
            auth: auth,
            videoId: response.data.id,
            media: {
                body: fs.createReadStream(thumbFilePath)
            },
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            console.log(response.data)
        })
    });

}

const YoutubeUrl = url => {
    const regexes = {
        video: /^.*(?:(?:youtu\.be\/|v\/|video\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/,
        playlist: /^.*(?:(?:youtu\.be\/|list=)|(\/playlist\?list=)|(\/watch\?(?:[^#\&\?]*&)*list=)|(\/watch\?list(?:i)?=)|(\/watch\?.+&list(?:i)?=))([^#\&\?]*).*/,
        stories: /^.*(?:(\/stories\/))([^#\&\?]*).*/,
        shorts: /^.*(?:(\/shorts\/))([^#\&\?]*).*/,
        channel: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:c\/|user\/|@)?|youtube\.com\/)([^#\&\?]*)/
    };
    for (const [type, regex] of Object.entries(regexes)) {
        const match = url.match(regex);
        if (match) {
            return {
                data: match[2] || match[5] || (match[1] && match[1].replace(/^@/, '')),
                type
            };
        }
    }
    return false;
};




router.get("/searchby", async (request, response) => {

    try {

        // const url = "https://www.youtube.com/shorts/iP768tM-_i8"
        // const url = "https://youtu.be/MomAhAv-UbQ"
        // const url = "https://www.youtube.com/v/_GaCFgGQtAo"
        // const url = "https://www.youtube.com/video/_GaCFgGQtAo"
        // const url = "https://www.youtube.com/watch?v=_GaCFgGQtAo"
        // const url = "https://www.youtube.com/watch?v=_GaCFgGQtAo&list=PLzufeTFnhupyeHB3A_jWlWO0Kimwmu6l5"
        // const url = "https://www.youtube.com/playlist?&list=PLzufeTFnhupyeHB3A_jWlWO0Kimwmu6l5"
        // const url = "https://www.youtube.com/SETIndia"
        const url = "https://www.youtube.com/@SETIndia"
        // const url = "https://www.youtube.com/c/SETIndia"
        // const url = "https://www.youtube.com/c/@SETIndia"
        // const url = "https://www.youtube.com/user/@SETIndia"
        // const url = "https://www.youtube.com/user/SETIndia"
        // const url = "https://www.ysafsdgout.com/user/SETIndia"

        // const url = "https://www.instagram.com/ikbirsingh";


        // console.log(isYoutubeUrl(url));
        // if (isYoutubeUrl(url)) {
        //     const { data, type } = isYoutubeUrl(url);
        //     console.log(data, type)
        // //     console.log(`The URL is a YouTube ${type} URL. The ${type} ID is ${data}.`);
        //     if (type === 'channel') {
        //         (async () => {
        //             var engagementrate = await getChannelEngagementRate(data)
        //             console.log(engagementrate)
        //         })();

        //     }
        // } else {
        //     console.log('The URL is not a YouTube URL.');
        // }


        getSocialMediaSite(url)
            .then(result => {
                if (result) {
                    const functionType = {
                        Instagram: 'ig',
                        YouTube: YoutubeUrl(url),
                    };
                    for (const [socialmediatype, functiontype] of Object.entries(functionType)) {
                        const match = result.match(socialmediatype);
                        if (match) {
                            const { data, type } = functiontype;
                            if (data, type) {
                                console.log(data, type)
                                if (type === 'channel') {
                                    (async () => {
                                        var engagementrate = await getChannelEngagementRate(data)
                                        console.log(engagementrate)
                                    })();

                                }
                            }
                            else {
                                console.log("functiontype is not working properly");
                            }
                        }
                    }
                } else {
                    console.log('This is not a Social Media Url.');
                }

            });



        response.status(201).json(url);

    }
    catch (error) {
        response.status(422).json(error)
    }
});

// router.get("/uploadvideo", async (request, response) => {

//     try {

//         // getAccessTokenforupload().catch(console.error);

//         response.status(201).json("done");

//     }
//     catch (error) {
//         response.status(422).json(error)
//     }
// });


router.get('/upload-video', async (req, res) => {
    try {

        res.render('upload-video');

        // res.status(201).json("done");

    }
    catch (error) {
        res.status(422).json(error)
    }
});

const OAuth2Data = require('../models/googleauth/client_secret_611814030717-1potj5h9cvj1gmacfsqpt1vjcnnlhbdd.apps.googleusercontent.com.json');
// const { google } = require("googleapis");
const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
var authed = false;

router.get("/youtube-video", async (req, res) => {
    if (!authed) {
        const SCOPES =
            "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile";

        // Generate an OAuth URL and redirect there
        var url = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
        });
        console.log(url);
        res.render("youtube-video", { url: url });
    } else {
        var oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: "v2",
        });
        oauth2.userinfo.get(function (err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
                res.render('upload-video');
            }
        });
    }
});

router.get("/oauth2callback", function (req, res) {
    const code = req.query.code;
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log("Error authenticating");
                console.log(err);
            } else {
                console.log("Successfully authenticated");
                console.log(tokens);
                oAuth2Client.setCredentials(tokens);
                console.log("databse");

                authed = true;
                res.redirect("/youtube-video");
            }
        });
    }
});

router.post('/upload-video', async (req, res) => {

    var currUpload = uploadFnct('youtube-videos', 'video');
    currUpload(req, res, function (err) {
        if (err) {
            console.log({ error_code: 1, err_desc: err });
            return;
        }
        console.log({ error_code: 0, err_desc: null, filename: req.file.filename });
        console.log(req.file.path);
        title = req.body.title;
        description = req.body.description;
        console.log(title);
        console.log(description);
        const youtube = google.youtube({ version: "v3", auth: oAuth2Client });
        console.log(youtube)
        youtube.videos.insert(
            {
                resource: {
                    // Video title and description
                    snippet: {
                        title: title,
                        description: description
                    },
                    // I don't want to spam my subscribers
                    status: {
                        privacyStatus: "private",
                    },
                },
                // This is for the callback function
                part: "snippet,status",

                // Create the readable stream to upload the video
                media: {
                    body: fs.createReadStream(req.file.path)
                },
            },
            (err, data) => {
                if (err) throw err
                console.log(data)
                console.log("Done.");
            }
        );

    });
    // req.file contains information about the uploaded file
    // req.body contains other form fields
    // console.log(req)
    res.send('File uploaded successfully');
});


router.get("/youtube-logout", (req, res) => {
    authed = false;
    res.redirect("/youtube-video");
});

// Your Client ID- 611814030717-1potj5h9cvj1gmacfsqpt1vjcnnlhbdd.apps.googleusercontent.com
// Your Client Secret- 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


const getSocialMediaSite = async (url) => {

    // Object mapping regular expressions to friendly names for the social media sites
    const sites = {
        "Facebook": /^(?:https?:\/\/)?(?:www\.)?(?:(?:facebook\.com)|(?:fb\.me))/i,
        "Instagram": /^(?:https?:\/\/)?(?:www\.)?(?:(?:instagram\.com)|(?:instagr\.am))/i,
        "Twitter": /^(?:https?:\/\/)?(?:www\.)?(?:(?:twitter\.com)|(?:t\.co))/i,
        "Google+": /^(?:https?:\/\/)?(?:www\.)?(?:(?:plus\.google\.com)|(?:g\.co))/i,
        "YouTube": /^(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be)|(?:youtube\.com))/i,
        "Pinterest": /^(?:https?:\/\/)?(?:www\.)?(?:(?:pinterest\.com)|(?:pin\.it))/i,
        "LinkedIn": /^(?:https?:\/\/)?(?:www\.)?(?:(?:linkedin\.com)|(?:lnkd\.in))/i,
        "Reddit": /^(?:https?:\/\/)?(?:www\.)?(?:(?:reddit\.com)|(?:redd\.it))/i
    };
    // Loop through the sites and test the URL
    for (const [siteName, regex] of Object.entries(sites)) {
        if (await regex.test(url)) {
            return siteName;
        }
    }
    return null;
}


router.get("/checkLink", async (request, response) => {
    try {

        // const url = "https://www.youtube.com/shorts/iP768tM-_i8"
        // const url = "https://youtu.be/MomAhAv-UbQ"
        // const url = "https://www.youtube.com/v/_GaCFgGQtAo"
        // const url = "https://www.youtube.com/video/_GaCFgGQtAo"
        // const url = "https://www.youtube.com/watch?v=_GaCFgGQtAo"
        // const url = "https://www.youtube.com/watch?v=_GaCFgGQtAo&list=PLzufeTFnhupyeHB3A_jWlWO0Kimwmu6l5"
        // const url = "https://www.youtube.com/playlist?&list=PLzufeTFnhupyeHB3A_jWlWO0Kimwmu6l5"
        // const url = "https://www.youtube.com/SETIndia"
        // const url = "https://www.youtube.com/@SETIndia"
        // const url = "https://www.youtube.com/c/SETIndia"
        // const url = "https://www.youtube.com/c/@SETIndia"

        const url = "https://www.instagram.com/ikbirsingh";



        getSocialMediaSite(url)
            .then(result => {
                console.log(result);
            });

        response.status(201).json(url);

    }
    catch (error) {
        response.status(422).json(error)
    }
});



router.get("/testlink", async (request, response) => {
    try {

        console.log("sfsd")

        // const instaTouch = require('instatouch');

        // (async () => {
        //     try {
        //         const options = { count: 200 };
        //         const likers = await instaTouch.likers('B7wOyffArc5', options);
        //         console.log(likers);
        //         response.status(422).json(likers)
        //     } catch (error) {
        //         console.log(error);
        //         response.status(422).json(error)
        //     }
        // })();

        // let { igApi } = require("insta-fetcher");

        // // some example with proxy, but i never test it
        // let ig = new igApi("54109134244%3AdDjEHhAxVycvOI%3A8%3AAYc6yf8VxFhDJ5Hw5GpuajFUdYekq66iR7kw2aholg", false, {
        //     proxy: {
        //         host: 'https://www.instagram.com/login',
        //         port: 80,
        //         auth: { username: 'punjabi_chatpat', password: 'punjabi12#$' }
        //     }
        // });

        // // Public post
        // ig.fetchPost("https://www.instagram.com/reel/CXhW_4sp32Z/").then((res) => {
        //     console.log(res);
        // });

        // const ig  = require("instagram-scraping");

        // // ig.scrapeComment('CPHnIGbBh1k').then(result => {
        // //     console.dir(result);
        // // });
        // ig.scrapeUserPage('jcvrnd19').then(result => {
        //     // console.dir(result);
        //     response.status(201).json(result)
        // });


        /* Create the base function to be ran */

        const cheerio = require("cheerio");
        const request = require("request-promise");


        const start = async (username) => {
            /* Here you replace the username with your actual instagram username that you want to check */
            const BASE_URL = `https://www.instagram.com/${username}/`;

            /* Send the request and get the html content */
            let response = await request(BASE_URL, {
                accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "accept-encoding": "gzip, deflate, br",
                "accept-language":
                    "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1",
                "user-agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
            });

            /* Initiate Cheerio with the response */
            let $ = cheerio.load(response);

            // /* Get the proper script of the html page which contains the json */
            let script = $("script").eq(4).html();
            console.log(script)

            // /* Traverse through the JSON of instagram response */
            // let {
            //     entry_data: {
            //         ProfilePage: {
            //             [0]: {
            //                 graphql: { user },
            //             },
            //         },
            //     },
            // } = JSON.parse(/window\._sharedData = (.+);/g.exec(script)[1]);

            // /* Output the data */
            // return user;
            return script;
        };

        start('yrf').then((data) => {
            // console.log(data);
            response.status(201).json(data)
        });

    }
    catch (error) {
        response.status(422).json(error)
    }
});


// router.get("/testlink", async (request, response) => {
//     try {

//         console.log("sfsd")

//         let url = "https://www.instagram.com/reel/Cny0MMJIRjf/?__a=1&__d=dis";

//         http.get(url, (res) => {
//             let body = "";

//             res.on("data", (chunk) => {
//                 body += chunk;
//             });

//             res.on("end", () => {
//                 try {
//                     let json = JSON.parse(body);
//                     // do something with JSON
//                     console.log(json)
//                     response.status(201).json(json)
//                 } catch (error) {
//                     console.error(error.message);
//                     response.status(422).json("error")
//                 };
//             });

//         }).on("error", (error) => {
//             console.error(error.message);
//             response.status(422).json(error)
//         });

//     }
//     catch (error) {
//         response.status(422).json(error)
//     }
// });






module.exports = router;
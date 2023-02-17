const jwt = require("jsonwebtoken");
const userLogin = require("../models/loginSchema");

const Authenticate = async (req,res,next)=>
{
   try{
    const token = req.cookies.usertoken;
    const verifyToken = jwt.verify(token , process.env.SECRET_KEY);

    // const rootuser = await userLogin.findOne({_id:verifyToken._id, "tokens.token":token});
    const rootuser = await userLogin.findOne({_id:verifyToken._id});

    if(!rootuser)
    {
        throw new error("user not fond")
    }
    req.token = token;
    req.rootuser = rootuser;
    req.objectId = rootuser._id;
    req.userId = rootuser.user_id;
    req.usertype = rootuser.user_type;

    next();

   }
   catch(err)
   {
    res.status(401).send("Unauthorized:No Token Provided");
    //console.log(err);
   }
}
module.exports = Authenticate
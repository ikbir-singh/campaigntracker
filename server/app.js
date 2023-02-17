require ("dotenv").config();

const express  = require("express");
const app = express();

const path = require('path')

const mongoose = require("mongoose");
require ("./database/conn");

const cookieParser = require("cookie-parser");

const cors = require("cors");

const router_site = require("./routes/site_router");

const port = 3001;


// app.use(cors());
app.use(cors({ credentials : true, origin:'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(router_site);

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', 'views')


app.listen(port , () => {
    console.log(`server is start port number ${port}`);
});
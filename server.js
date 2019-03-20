const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const bodyParser = require("body-parser");
const app = express();

const passport = require("passport");
const path = require("path");
const cors=require('cors')
//enable cors
app.use(cors())
// app.use(function(req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", '*');
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.setHeader("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
//     next();
// });
//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//
//DB Config
const db = require("./config/key").mongoURI;
//Connect to MongoDB
mongoose
 .connect(db)
 .then(() => {
  console.log("MongoDB connected");
 })
 .catch(error => {
  console.log(error);
 });

//Passport Middleware
app.use(passport.initialize());
//Passport Config
require("./config/passport")(passport);

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;
app.listen(port, () => {
 `Server running on port ${port}`;
});

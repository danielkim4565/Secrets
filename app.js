//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption'); 

const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.use(express.static(__dirname + 'public'));

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

const secret = 'key';

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.render("secrets");
        }
    })
});

app.post("/login", function(req,res) {
    const email = req.body.username;
    const password = req.body.password;

    User.findOne({email: email}, function(err, foundUser) {
        if (err) {
            res.send(err);
        }  else if (foundUser) {
            if (password === foundUser.password) {
                res.render("secrets");
            }
        } 
    });
});

app.listen(3000, function() {
    console.log("Server is up")
});
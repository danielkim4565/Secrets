//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption'); 
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const passort = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');



const app = express();

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + 'public'));

app.use(session({
    secret: 'Something that will need to be moved',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("login");
    }
});

app.get("/logout", function(req, res) {
    req.logout(function(err){
        res.redirect("/");
    });

});

app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local") (req, res, function() {
                res.redirect("/secrets");
            });
        }
        
    });

});

app.post("/login", passport.authenticate("local", { failureRedirect: '/login' }), function(req ,res) {
    res.redirect("/secrets"); 
});


app.listen(3000, function() {
    console.log("Server is up")
});
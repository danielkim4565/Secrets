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
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/userDB';
const { setupDB } = require('./db');

const app = express();

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'Something that will need to be moved',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected!'))
.catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username, name: user.name });
    });
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
        User.find({secret: {$ne: null}}, function(err, foundUsers) {
            if (!err) {
                res.render("secrets", {secrets: foundUsers});
            }
        })
        
    } else {
        res.redirect("login");
    }
});

app.get("/submit", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("login");
    }
});

app.get("/logout", function(req, res) {
    req.logout(function(err){
        res.redirect("/");
    });

});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/secrets');
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

app.post("/submit", function(req, res) {
    console.log(req.user);
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            foundUser.secret = req.body.secret;
            foundUser.save(function(err) {
                res.redirect("/secrets");
            });
        }
    })
})

app.listen(3000, function() {
    console.log("Server is up")
});
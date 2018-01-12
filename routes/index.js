var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require("../models/users");

router.get("/", function(req, res){
   res.render("home");
});

router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate('local', { successRedirect: "/campgrounds", failureRedirect: "/login", failureFlash: true }), function(req, res){
    
});


router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
   User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, newUser){
       if(err){
           req.flash("error", err.message);
           res.redirect("register");
       }else{
           passport.authenticate('local', { successRedirect: "/campgrounds", failureRedirect: "/login", failureFlash: true })(req, res, function(){
               req.flash("success", "Welcome to Yelpcamp "+ newUser.username);
               res.redirect("/campgrounds");
           });
       }
   });
});

router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Successfully logged out");
   res.redirect("/campgrounds");
});

router.get("/profile/:username", function(req, res){
    User.find({username: req.params.username}, function(err, foundUser){
       if(err || !foundUser){
           req.flash("User profile not found");
           res.redirect("/campgrounds");
       } else {
           res.send(foundUser);
       }
    }); 
});


module.exports = router;
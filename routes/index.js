var express         = require("express");
var router          = express.Router();
var passport        = require("passport");
var User            = require("../models/users");
var middlewareObj   = require("../middleware");
var multer          = require('multer');

//setup multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/users');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname);
  }
});
var upload = multer({ storage: storage });

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
    User.findOne({username: req.params.username}, function(err, foundUser){
       if(err || !foundUser){
           req.flash("error", "User profile not found");
           res.redirect("/campgrounds");
       } else {
           res.render("users/show", {user: foundUser});
       }
    }); 
});

router.get("/profile/:username/edit", middlewareObj.checkCurrentuser, function(req, res){
    res.render("users/edit", {user: req.user} );
});

router.put("/profile/:username", middlewareObj.checkCurrentuser, upload.single('user[profileImage]'), function(req, res){
    var user = req.body.user;
    if(req.file){
        user.profileImage = req.file.filename;
    }
    //first we have to find user id from username and then use findByIdAndUpdate mongoose function to update user profile
    User.findOne({username: req.params.username}, function(err, foundUser){
        if(err || !foundUser){
            req.flash("User profile not found");
            res.redirect("/campgrounds");
        } else {
            User.findByIdAndUpdate(foundUser._id, user, function(err, updatedUser){
                if(err || !updatedUser){
                    req.flash("User profile not found");
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Profile updated successfully");
                    res.redirect("/profile/" + updatedUser.username);
               }
            });
        }
    })
});

module.exports = router;
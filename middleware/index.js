var Campground      = require("../models/campgrounds.js");
var Comment         = require("../models/comments.js");
var User            = require("../models/users.js");
var middlewareObj   = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, campground){
            if(err || !campground){
                req.flash("error", "Campground not found");
                res.redirect("/campgrounds");
            } else {
                if(campground.author.id.equals(req.user._id) || req.user.isAdmin){
                    req.campground = campground;
                    next();
                } else {
                    req.flash("error", "You are not authorized to do that");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err || !comment){
                req.flash("error", "Comment not found");
                res.redirect("/campgrounds/" + req.params.camp_id);
            } else {
                if(comment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You are not authorized to do that");
                    res.redirect("/campgrounds/" + req.params.camp_id);
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("/login");
    }
}

middlewareObj.checkCurrentuser = function(req, res, next){
    if(req.isAuthenticated()){
        User.findOne({username: req.params.username}, function(err, foundUser){
            if(err || !foundUser){
                req.flash("error", "User not found");
                res.redirect("/profile/" + req.params.username);
            } else {
                if(foundUser._id.equals(req.user._id)){
                    req.user = foundUser;
                    next();
                } else {
                    req.flash("error", "You are not authorized to do that");
                    res.redirect("/profile/" + foundUser.username);   
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("/login"); 
    } 

}

module.exports = middlewareObj;

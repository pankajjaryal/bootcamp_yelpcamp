var Campground      = require("../models/campgrounds.js");
var Comment         = require("../models/comments.js");
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
        })
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
                    res.redirect("/campgrounds/" + req.params.capm_id);
                }
            }
        })
    } else {
        req.flash("error", "Please login first");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;

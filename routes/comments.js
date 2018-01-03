var express         = require("express");
var routes          = express.Router();
var Campground      = require("../models/campgrounds");
var Comment         = require("../models/comments")
var middlewareObj   = require("../middleware/");

routes.get("/campgrounds/:id/comments/new", middlewareObj.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.id);
        }else{
               res.render("comments/new", {campground: campground});     
        }
    });
});

routes.post("/campgrounds/:id/comments", middlewareObj.isLoggedIn, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
       } else {
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err);
               } else {
                    comment.author = { id: req.user._id, username: req.user.username }; 
                    comment.save();
                    campground.comments.push(comment);
                    campground.save(function(err, campgroundUpdated){
                       if(err){
                            req.flash("error", err.message);
                            res.redirect("/campgrounds/" + req.params.id);
                       } else {
                           res.redirect("/campgrounds/" + campground._id);
                       }
                   });
               }
           });
       }
   });
});

routes.get("/campgrounds/:camp_id/comments/:comment_id/edit", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.camp_id);
        } else {
            res.render("comments/edit", { campgroundId: req.params.camp_id, comment: comment } );        
        }
    })
    
});

routes.put("/campgrounds/:camp_id/comments/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.camp_id);
        } else {
            res.redirect("/campgrounds/" + req.params.camp_id);
        }
    });
});

routes.delete("/campgrounds/:camp_id/comments/:comment_id/delete", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.camp_id);
       } else {
           req.flash("success", "Comment deleted succesfully");
           res.redirect("/campgrounds/" + req.params.camp_id);
       }
    });
});

module.exports = routes;
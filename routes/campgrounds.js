var express         = require("express");
var router          = express.Router();
var Campground      = require("../models/campgrounds.js");
var middlewareObj   = require("../middleware");

router.get("/campgrounds", function(req, res){
    
    Campground.find({}, function(err, camps){
       if(err){
           console.log(err);
       } else {
           res.render("campgrounds/campgrounds", {campgrounds: camps});
       }
    });
    
    
});

router.post("/campgrounds", middlewareObj.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = { id: req.user._id, username: req.user.username };
    var campground = {name: name, image: image, description: description, author: author };
    
    Campground.create(campground, function(err, camp){
        if(err){
            req.flash("error", err.message);
            req.redirect("/camgrounds");
        }else{
            console.log(camp);
        }
    });
    req.flash("success", "Campground added successfully")
    res.redirect("/campgrounds");
});

router.get("/campgrounds/new", middlewareObj.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

router.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: campground});
        }
    })
});

router.get("/campgrounds/:id/edit", middlewareObj.checkCampgroundOwnership, function(req, res){
    //req.campgroundcomes from middleware
    res.render("campgrounds/edit", { campground: req.campground });

});

router.put("/campgrounds/:id", middlewareObj.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
      if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.id);
      } else {
          req.flash("success", "Campground updated successfully");
          res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

router.delete("/campgrounds/:id", middlewareObj.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("error", "Camground deleted successfully");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;
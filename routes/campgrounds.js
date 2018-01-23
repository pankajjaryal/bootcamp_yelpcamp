var express         = require("express");
var router          = express.Router();
var multer          = require('multer');
var Campground      = require("../models/campgrounds.js");
var middlewareObj   = require("../middleware");

//setup multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/campgrounds');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname);
  }
});
var upload = multer({ storage: storage });

router.get("/campgrounds", function(req, res){
    
    var perPage = 4;
    var page = req.query.page || 1;
    if(page < 1){
        page = 1;
    }
    var noMatch = "";
    if(req.query.search && req.query.search.trim().length > 0){
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex})
        .skip((perPage * (page - 1)))
        .limit(perPage)
        .exec(function(err, camps){
           if(err){
               console.log(err);
           } else {
               if(camps.length == 0){
                    noMatch = "No campground found within this name, please try again!";
               }
               console.log(req.originalUrl);
                res.render("campgrounds/campgrounds", {
                   campgrounds: camps,
                   current: page,
                   pages: Math.ceil(camps.length/perPage),
                   noMatch: noMatch
                });
           }
        });
    } else {
        
        Campground
        .find({})
        .skip((perPage * page ) - perPage)
        .limit(perPage)
        .exec(function(err, camps){
            if (err || !camps){
                console.log (err);
            } else {
                
                Campground.count().exec(function(err, count){
                    if (err){
                        console.log(err);
                    } else {
                        
                        res.render("campgrounds/campgrounds", {
                            campgrounds: camps,
                            current: page,
                            pages: Math.ceil(count/perPage),
                            noMatch: noMatch
                        });
                    }
                });
            }
        });
    }
    
});

//add a new campground route
router.post("/campgrounds", middlewareObj.isLoggedIn, upload.single('imageUpload'), function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    if(req.file){    
        var imageUpload = req.file.filename;
    }
    var price = req.body.price;
    var description = req.body.description;
    var author = { id: req.user._id, username: req.user.username };
    var campground = {name: name, image: image, imageUpload:imageUpload, price: price, description: description, author: author };
    
    Campground.create(campground, function(err, camp){
        if(err){
            req.flash("error", err.message);
            res.redirect("/camgrounds");
        }else{
            console.log(camp);
        }
    });
    
    req.flash("success", "Campground added successfully");
    res.redirect("/campgrounds");
});

router.get("/campgrounds/new", middlewareObj.isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

router.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        }else{
            res.render("campgrounds/show", {campground: campground});
        }
    })
});

router.get("/campgrounds/:id/edit", middlewareObj.checkCampgroundOwnership, function(req, res){
    //req.campgroundcomes from middleware
    res.render("campgrounds/edit", { campground: req.campground });

});

router.put("/campgrounds/:id", middlewareObj.checkCampgroundOwnership, upload.single('campground[imageUpload]'), function(req, res){
   
   var campground = req.body.campground;
   if(req.file){
       campground.imageUpload = req.file.filename; 
   }
   
   Campground.findByIdAndUpdate(req.params.id, campground, function(err, updatedCampground){
      if(err || !updatedCampground){
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
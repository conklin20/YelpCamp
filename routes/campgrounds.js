var express         = require("express"),
    router          = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"); 

// **********************
// ROUTES - CAMPGROUND
// **********************

//INDEX ROUTE - show all campgrounds
router.get("/", function(req, res){ 
    //get all campgrounds from db 
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err); 
        } else {
            //then render the file
            res.render("campgrounds/index", {campgrounds: allCampgrounds}); 
        }
    }); 
}); 

//CREATE ROUTE - add new campground to db
router.post("/", middleware.isLoggedIn, function(req, res){
    //Get data from form, and add to campgrounds array 
    var name = req.body.name; 
    var image = req.body.image; 
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id, 
        username: req.user.username
    };
    var newCampground = {
        name: name, 
        image: image,
        description: desc, 
        price: price, 
        author: author 
    };
    //create a new campground and save to db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err); 
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
    
}); 

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
}); 

//SHOW - shows detail about a single campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground}); 
    });
});

// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           console.log(err); 
           res.redirect("/campgrounds"); 
       } else {
           res.redirect("/campgrounds/" + req.params.id); 
       }
    });
    //then redirect to show page 
});

// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //delete the blog 
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds"); 
        } else {
            //redirect
            res.redirect("/campgrounds"); 
        }
    }); 
});


module.exports = router; 
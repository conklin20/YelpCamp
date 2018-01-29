var express         = require("express"),
    router          = express.Router({mergeParams: true}), //this is critical for letting us pass route params (:id) from page to page
    Campground      = require("../models/campground"), 
    Comment         = require("../models/comment"), 
    middleware      = require("../middleware");
    
// **********************
// ROUTES - COMMENTS
// **********************
// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find the campground by id 
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err); 
       } else {
           res.render("comments/new", {campground: campground}); 
       }
    });
}); 

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground from ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds"); 
        } else {
            //create new comment 
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Error submitting the comment, please try again."); 
                    console.log(err); 
                } else {
                    //add username and id to the comment (we will have a user object if the code reaches this point because of our middleware isLoggedIn)
                    comment.author.id = req.user._id; 
                    comment.author.username = req.user.username; 
                    //save comment 
                    comment.save(); 
                    //connect comment to campground by pushing the commentid into the array on the campground schema
                    campground.comments.push(comment._id);
                    
                    campground.save();
                    req.flash("success", "Successfully added comment."); 
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
}); 

// EDIT ROUTE 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");    
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment}); 
        }
    });
});

// UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //req.body.comment.text =  "<em> Edited</em>" + req.body.comment.text;
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back"); 
        } else {
            res.redirect("/campgrounds/" + req.params.id); 
        }
    });
});

// DESTROY ROUTE 
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //delete the comment 
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back"); 
        } else {
            req.flash("success", "Comment deleted."); 
            //redirect
            res.redirect("/campgrounds/" + req.params.id); 
        }
    }); 
});


module.exports = router; 
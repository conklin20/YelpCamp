var Campground  = require("../models/campground"), 
    Comment    = require("../models/comment");
    
// All middleware goes here 
var middlewareObj = {}; 

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //is user logged in
    if (req.isAuthenticated()){
        //if so, does user own campground
        //find the campground by id 
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground lookup error, please try again."); 
                res.redirect("back"); 
            } else {
                //check for ownership 
                if(foundCampground.author.id.equals(req.user._id)){
                    return next();  
                } else {
                    req.flash("error", "You don't have permission to edit this campground."); 
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "Please Login First!"); 
        res.redirect("back"); 
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    //is user logged in
    if (req.isAuthenticated()){
        //if so, does user own comment
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Comment lookup error, please try again."); 
                res.redirect("back"); 
            } else {
                //check for ownership 
                if(foundComment.author.id.equals(req.user._id)){
                    return next();  
                } else {
                    req.flash("error", "You don't have permission to edit this comment."); 
                    res.redirect("back"); 
                }
            }
        });
    } else {
        req.flash("error", "Please Login First!"); 
        res.redirect("back"); 
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next(); 
    }
    req.flash("error", "Please Login First!"); 
    res.redirect("/login");
}


module.exports = middlewareObj; 
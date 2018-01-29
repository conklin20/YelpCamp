var express         = require("express"),
    router          = express.Router(),
    passport        = require("passport"),
    User            = require("../models/user")

// **********************
// ROUTES - INDEX and AUTH
// These ROUTES follow the REST pattern
// **********************
router.get("/", function(req, res){
    res.render("landing"); 
}); 

// AUTH ROUTES
// INDEX ROUTE
router.get("/register", function(req, res){
    res.render("users/register"); 
}); 

// CREATE ROUTE
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message); 
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username); 
            res.redirect("/campgrounds"); 
        });
    });
});

// Show Login Form 
router.get("/login", function(req, res){
    res.render("users/login"); 
}); 

// Use middleware as the 2nd arg (object) to log user in
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// Logout route 
router.get("/logout", function(req, res){
   req.logout(); 
   req.flash("success", "Successfully Logged Out"); 
   res.redirect("/campgrounds");
});

module.exports = router; 
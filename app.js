var express         = require("express"), 
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"), 
    flash           = require("connect-flash"),
    passport        = require("passport"), 
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"), 
    Comment         = require("./models/comment"), 
    User            = require("./models/user"),
    seedDB          = require("./seeds"),
    app             = express(); 

// Hookup our routes 
var campgroundRoutes    = require("./routes/campgrounds");
var commentRoutes       = require("./routes/comments");
var indexRoutes         = require("./routes/index");

// **********************
// Database Config
// **********************
var dbVersion = "_v11";
// mongoose.connect("mongodb://localhost/yelp_camp" + dbVersion); 
mongoose.connect("mongodb://caryc:vikings@ds219318.mlab.com:19318/yelpcamp");

// Needs to come before passport config
app.use(flash()); //used for our flash messages... this lib is pretty old so hold on

// **********************
// Passport Config
// **********************
app.use(require("express-session")({
    secret: "I am not sure what this secret is doing", 
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// **********************
//  Custom middleware 
// **********************
// pass our currentUser object to all routes 
app.use(function(req, res, next){
   res.locals.currentUser = req.user; 
   res.locals.error = req.flash("error"); 
   res.locals.success = req.flash("success"); 
   next(); 
});

// **********************
//  Other setup requirements
// **********************
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public")); //need this to use our CSS files
app.use(methodOverride("_method")); //overriding HTML froms ability to only send POST and GET routes 
// To actually be able to use our routes 
app.use("/campgrounds", campgroundRoutes); 
app.use("/campgrounds/:id/comments", commentRoutes); 
app.use(indexRoutes); 

//seed our db for  testing only
//seedDB(); 


// **********************
// Listener for the server 
// **********************
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server listening..."); 
}); 
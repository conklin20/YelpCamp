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
// Using environment variables here to distinguish between our test (C9) db version, and our "prod" or "deployed" (heroku) db version 
// In order to do so, we need to run the following commands to CREATE an environment variable in both enviornments 
// 1) For Cloud9, run cmd: export DATABASEURL=mongodb://localhost/yelp_camp
// 2) For Heroku, run cmd: heroku config:set DATABASEURL=mongodb://<username>:<password>@ds219318.mlab.com:19318/yelpcamp
//      OR: you can go to your Heroku account, and under settings of your app find "config vars" and manually add key: DATABASEURL value:  { heroku url string }
//      URL for this Heroku db: mongodb://<username>:<password>@ds219318.mlab.com:19318/yelpcamp
// **********************
mongoose.connect(process.env.DATABASEURL); 

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
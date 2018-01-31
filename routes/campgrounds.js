var express         = require("express"),
    router          = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"), 
    geocoder        = require("geocoder"),
    multer          = require('multer');
    //cloudinary      = require('cloudinary');
    

// **********************
// Configuring image upload feature using multer and cloudinary 
// **********************
var storage =   multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter}).any('image', 5);

// cloudinary.config({ 
//   cloud_name: 'caryconklin', 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// **********************
// ROUTES - CAMPGROUND
// **********************

//INDEX ROUTE - show all campgrounds
router.get("/", function(req, res){ 
    //if they 
    var noMatch;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); 
        
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err); 
            } else {
                if(allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again."; 
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch}); 
            }
        }); 
    } else {
        //get all campgrounds from db 
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err); 
            } else {
                //then render the file
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch}); 
            }
        }); 
    }
}); 

//CREATE ROUTE - add new campground to db
router.post("/", middleware.isLoggedIn, function(req, res){
 
    //get google maps data
    geocoder.geocode(req.body.location, function(err, data){
        if(err){
            // req.flash("error", err.message); 
            // return res.redirect("/campgrounds");
            console.log(err); 
        } else {
            req.body.campground.location = {
                lat: data.results[0].geometry.location.lat,
                lng: data.results[0].geometry.location.lng,
                address: data.results[0].formatted_address
            };
        }
        
        //grab the author
        var author = {
            id: req.user._id, 
            username: req.user.username
        };
            
        //upload images
        upload(req, res, function(err){
            if(err) {
                req.flash('error', err.message);
                return res.end("Error uploading file. Error: " + err.message);
            }
            
            //build out the images array 
            var images = [];
            req.files.forEach(function(file){
                images.push(file.filename);
            }); 
            
            var newCampground = {
                name: req.body.name, 
                images: images,
                description: req.body.description, 
                price: req.body.price, 
                author: author 
            };
            
            //Save the campground
            Campground.create(newCampground, function(err, campground) {
                if (err) {
                    console.log(err); 
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                res.redirect('/campgrounds/' + campground.id);
            });
            
            /*//var images = [];
            var imagesPreUpload = []; 
            var imagesPostUpload = []; 
            for(var i = 0; i < req.files.length; i++) {
                imagesPreUpload.push(req.files[i].path);
            
                cloudinary.v2.uploader.upload(req.files[i].path, function(error, result) {
                    // add cloudinary url for the image to the campground object under image property
                    if(!error){
                        imagesPostUpload.push(result.secure_url); 
                        console.log("images AFTER to upload: " + imagesPostUpload); 
                    }
                });
            }*/
            
        }); 
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
    //get google maps data
    geocoder.geocode(req.body.campground.location, function(err, data){
        if(err){
            req.flash("error", err.message); 
            return res.redirect("/campgrounds");
        } else {
            // we can sometime run over our query limit for this free google maps API, so lets check for an error message
            if(data.results && !data.error_messge){
                req.body.campground.location = {
                    lat: data.results[0].geometry.location.lat,
                    lng: data.results[0].geometry.location.lng,
                    address: data.results[0].formatted_address
                };
            }
            //check if user wants to remove the current image
            if(req.body.removeImage) {
                req.body.campground.image = '/uploads/no-image.png';
            }
            else if(req.file) {            
                cloudinary.uploader.upload(req.file.path, function(err, result) {
                    if(err){
                      req.flash("error", err.message);
                      res.redirect("back"); 
                    }
                    // add cloudinary url for the image to the campground object under image property
                    req.body.campground.image = result.secure_url;
                }); 
            }
            
            //find and update correct campground
            Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
                if(err){
                  req.flash("error", err.message);
                  res.redirect("back"); 
                } 
                req.flash("success","Successfully Updated!");
                //then redirect to show page 
                res.redirect("/campgrounds/" + req.params.id); 
            });
        }
    }); 
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

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); 
};


module.exports = router; 
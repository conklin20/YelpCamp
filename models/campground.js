var mongoose = require("mongoose");

//Campground schema
var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   price: String,
   location: {
      address: String, 
      lat: Number, 
      long: Number
   },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   timestamp:  { 
        type:       Date, 
        default:    Date.now //default date 
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

// Compile into model and export 
module.exports = mongoose.model("Campground", campgroundSchema);
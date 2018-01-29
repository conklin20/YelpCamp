var mongoose = require("mongoose"); 

//comment Schema 
var commentSchema = mongoose.Schema({
    text: String,
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
    } 
});

// Compile into model and export 
module.exports = mongoose.model("Comment", commentSchema);
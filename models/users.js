var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: String,
   email: String,
   password: String,
   profileImage: String,
   firstName: String,
   lastName: String,
   city: String,
   country: String,
   bio: String,
   isAdmin: {type: Boolean, default: false}
});

var options = ({usernameQueryFields: ['email']});

userSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model("User", userSchema);
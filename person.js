var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/persons", { useMongoClient: true });
mongoose.Promise = global.Promise;

var peopleSchema = new mongoose.Schema({
    name: String,
    age: Number,
    city: String
});

var People = mongoose.model("people", peopleSchema);

// People.create({
//     name: "Shyla",
//     city: "Ludhiana",
//     age: 3
// }, function(err, people){
//   if(err){
//       console.log(err);
//   } else {
//       console.log(people);
//   }
// });

People.find({}, function(err, people){
    if(err){
        console.log(err);
    }else{
        console.log("people");
        console.log(people);
    }
});

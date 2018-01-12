var express                 = require("express");
var app                     = express();
var bodyParser              = require("body-parser");
var mongoose                = require("mongoose");
var passport                = require("passport");
var passportLocal           = require("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");
var flash                   = require("connect-flash-plus");
var expressSession          = require("express-session");
var methodOverride          = require("method-override");


//setup mongodb
mongoose.connect(process.env.DBURL, { useMongoClient: true });
//mongoose.connect("mongodb://yelp:yelp@ds135817.mlab.com:35817/yelpcamp_bootcamp", {useMongoClient: true});
mongoose.Promise = global.Promise;

//use models
var Campground  = require("./models/campgrounds");
var Comment     = require("./models/comments");
var User        = require("./models/users");

//use routers
var campgrounds = require("./routes/campgrounds");
var comments    = require("./routes/comments");
var index       = require("./routes/index");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));
app.use(methodOverride('_method'));

//use flash messages
app.use(flash());

//order of sessions is very important, initialize express session first
app.use(expressSession({
    secret: "Krishvi",
    resave: false,
    saveUninitialized: false
}));

//setup passport for user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//setup user and flash sessions
app.use(function(req, res, next){
   res.locals.currentUser   = req.user;
   res.locals.error         = req.flash("error");
   res.locals.success       = req.flash("success");
   next();
});

//use routes
app.use(campgrounds);
app.use(comments);
app.use(index);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("App started: YelpCamp");
});
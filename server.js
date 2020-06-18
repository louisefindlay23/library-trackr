// Database Connections

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/booksdb";

// Node Modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const goodreads = require('goodreads-api-node');
const passport = require('passport');
const GoodreadsStrategy = require('passport-goodreads').Strategy;
const util = require('util');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const app = express();

// Goodreads API

var GOODREADS_KEY = "LDomy4VKhZXCrcE3rJ8TQ";
var GOODREADS_SECRET = "xCaCeVJvD5G7mbfu7FgEg0nyzFKl6WK63ph4CGLQuI";

const myCredentials = {
    key: GOODREADS_KEY,
    secret: GOODREADS_SECRET
};

var callbackURL = "http://127.0.0.1/goodreads";
const gr = goodreads(myCredentials, callbackURL);

// Passport Session

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Goodreads Passport

passport.use(new GoodreadsStrategy({
        consumerKey: GOODREADS_KEY,
        consumerSecret: GOODREADS_SECRET,
        callbackURL: "http://localhost:8080/auth/goodreads/callback"
    },
    function (token, tokenSecret, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Initalising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'truth will',
    resave: true,
    saveUninitialized: true
}));

app.use(logger('tiny'));
app.use(cookieParser());
app.use(bodyParser.raw());
app.use(methodOverride());

var db;

// connecting variable db to database
MongoClient.connect(url, function (err, database) {
    if (err) throw err;
    db = database;
    app.listen(8080, 'localhost');
    console.log('Listening on 8080');
});

// set default session.loggedin value
session.loggedin = false;

// *** GET Routes - display pages ***

// Root Route
app.get('/', function (req, res) {
    console.log(req.user);
    res.render('pages/index', {
        user: req.user
    });
});

// Single Book Route
app.get('/book', function (req, res) {
    var bookid = gr.showBook(req.query.id);
    bookid.then(function (result) {
        var bookdetails = result.book;
        console.log(bookdetails);
        res.render('pages/book', {
            bookdetails: bookdetails
        });
    });
});

// Register Form Route
app.get('/register', function (req, res) {
    var isLogged = req.session.loggedin;
    var msg = '';
    res.render('pages/register', {
        isLoggedIn: isLogged,
        signup_error: msg
    });
});

// Login Form Route
app.get('/login', function (req, res) {
    var msg = '';
    var isLogged = req.session.loggedin;
    res.render('pages/login', {
        login_error: msg,
        isLoggedIn: isLogged
    });
});

// Goodreads Authentication

app.get("/authenticate", function (req, res) {
    gr.getRequestToken()
        .then(url => {
            console.log(url);
            res.redirect(url);
        }).catch(function () {
            console.log("Promise Rejected");
        });
});

// Goodreads Login

app.get('/auth/goodreads',
    passport.authenticate('goodreads'),
    function (req, res) {});

app.get('/auth/goodreads/callback',
    passport.authenticate('goodreads', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/');
    });


// *** POST Routes ***

// Search Route
app.post('/search', function (req, res) {
    var bookquery = req.body.book;
    var booklist = gr.searchBooks({
        q: bookquery,
        page: 1,
        field: 'title'
    });
    booklist.then(function (result) {
        console.log(result);
        var bookresult = result.search.results.work;
        res.render('pages/search-results', {
            bookresult: bookresult
        });
    });
});

// Register user route
app.post('/register-user', function (req, res, next) {

    //get user details
    var name = req.body.username;
    var password = req.body.password;
    var pass_conf = req.body.confirm_password;
    var email = req.body.email;
    var error_msg = '';
    var isLogged = req.session.loggedin;

    //if any of input fields empty, display an error msg
    //d41d8cd98f00b204e9800998ecf8427e is an MD5 hash of empty string
    if (name === '' || password === '' || email === '' || pass_conf === '' || pass_conf == 'd41d8cd98f00b204e9800998ecf8427e' || password == 'd41d8cd98f00b204e9800998ecf8427e') {
        error_msg = 'Please provide all details';
        res.render('pages/register', {
            signup_error: error_msg,
            isLoggedIn: isLogged
        });
        return;

        //query the database for the user's details
    } else {
        db.collection('profiles').findOne({
            'username': name
        }, function (err, result) {
            if (err) throw err;

            //username must be unique so if in database, display an error msg
            if (result) {
                error_msg = 'The username already registered. Please try a different username';
                res.render('pages/register', {
                    signup_error: error_msg,
                    isLoggedIn: isLogged
                });
                return;
            }

            //if password and password confirmation dont match, display an error msg
            else if (pass_conf != password) {
                error_msg = 'Passwords entered must be identical';
                res.render('pages/register', {
                    signup_error: error_msg,
                    isLoggedIn: isLogged
                });
                return;
            }
            //create new user and insert into database
            var user_details = {
                "username": name,
                "password": password,
            };
            db.collection('profiles').save(user_details, function (err, result) {
                if (err) throw err;
                res.redirect('/login');
            });

        });
    }
});

//login form handler
app.post('/login-user', function (req, res) {

    //get user's input
    var name = req.body.name;
    var password = req.body.password;
    var error_msg = '';
    var isLogged = req.session.loggedin;

    //check is any of the input fields empty, if so, display an error msg
    //d41d8cd98f00b204e9800998ecf8427e is MD5hash for empty string
    if (name === '' || password === '' || password == 'd41d8cd98f00b204e9800998ecf8427e') {
        error_msg = 'Please enter your username and password';
        res.render('pages/login', {
            login_error: error_msg,
            isLoggedIn: isLogged
        });
        return;
    }

    //query the db, get users information
    db.collection('profiles').findOne({
        'username': name
    }, function (err, result) {
        if (err) throw err;

        //if username not in database display an error msg
        if (!result) {
            error_msg = 'The username or password you entered are incorrect';
            res.render('pages/login', {
                login_error: error_msg,
                isLoggedIn: isLogged
            });
            return;
        }

        //if the password entered matched user's password in the database change session.loggedin value to true and redirect the user to index page
        if (result.password == password) {
            req.session.loggedin = true;
            req.session.username = result.username;
            res.redirect('/');

            //if passwords dont match display an error msg
        } else {
            error_msg = 'The username or password you entered are incorrect';
            res.render('pages/login', {
                login_error: error_msg,
                isLoggedIn: isLogged
            });
            return;
        }
    });
});

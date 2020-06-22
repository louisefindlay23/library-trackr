// Node Modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
require('dotenv').config();
const goodreads = require('goodreads-api-node');
const app = require("https-localhost")();

// Goodreads API - NodeJS

const myCredentials = {
    key: process.env.GOODREADS_KEY,
    secret: process.env.GOODREADS_SECRET
};

var callbackURL = "https://localhost:8080/goodreads";
const gr = goodreads(myCredentials);
gr.initOAuth(callbackURL);

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

app.listen(8080);
console.log('Listening on 8080');

// set default session.loggedin value
session.loggedin = false;
var userid = null;

// *** GET Routes - display pages ***

// Root Route
app.get('/', function (req, res) {
    res.render('pages/index');
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

// Authenticate Goodreads
app.get("/authenticate", function (req, res) {
    gr.getRequestToken()
        .then(url => {
            console.log(url);
            res.redirect(url);
        }).catch(function () {
            console.log("Promise Rejected");
        });
});

// Request Goodreads
app.get("/goodreads", function (req, res) {
    gr.getAccessToken()
        .then(url => {
            var userinfo = gr.getCurrentUserInfo();
            userinfo.then(function (result) {
                userid = result.user.id;
                console.log("User ID:" + userid);
                res.redirect("/");
            });
        }).catch(function () {
            console.log("Promise Rejected");
        });
});

// Profile Route
app.get('/profile', function (req, res) {
    var usersbooks = gr.getOwnedBooks({
        userID: userid,
        page: 1
    });
    usersbooks.then(function (result) {
        var userbooklist = result.owned_books.owned_book;
        console.log(userbooklist);
        res.render('pages/profile', {
            userbooklist: userbooklist
        });
    });
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

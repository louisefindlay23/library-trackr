// Node Modules
const express = require('express');
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

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.listen(8080);
console.log('Listening on 8080');

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
    }).catch(function () {
            console.log("Book Search Rejected");
        });
});

// Add Book Route
app.get('/book/add', function (req, res) {
    var addbook = gr.addBookToShelf({
        bookID: req.query.id,
        shelfName: "shelf"
    });
    addbook.then(function (result) {
        console.log(result);
        res.redirect("/");
    }).catch(function (err) {
            console.log("Adding book rejected" + err);
        });
});

// Authenticate Goodreads
app.get("/authenticate", function (req, res) {
    gr.getRequestToken()
        .then(url => {
            console.log(url);
            res.redirect(url);
        }).catch(function () {
            console.log("Goodreads Authentication Rejected");
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
            console.log("Goodreads User Info Rejected");
        });
});

// Profile Configuration Route
app.get('/configure-profile', function (req, res) {
    var usersshelves = gr.getUsersShelves(userid);
    usersshelves.then(function (result) {
        var usershelf = result.user_shelf;
        console.log(usershelf);
        res.render('pages/profile-config', {
            usershelf: usershelf
        });
    }).catch(function () {
        console.log("Goodreads Get Shelves Rejected");
        console.log(usersshelves);
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
        res.render('pages/profile', {
            userbooklist: userbooklist
        });
    }).catch(function () {
        console.log("Goodreads Get Owned Books Rejected");
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
        var bookresult = result.search.results.work;
        console.log(bookresult);
        res.render('pages/search-results', {
            bookresult: bookresult
        });
    }).catch(function () {
        console.log("Goodreads Search Books Rejected");
    });
});

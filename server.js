// Node Modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const goodreads = require('goodreads-api-node');

// Goodreads API - NodeJS

const myCredentials = {
    key: 'LDomy4VKhZXCrcE3rJ8TQ',
    secret: ' xCaCeVJvD5G7mbfu7FgEg0nyzFKl6WK63ph4CGLQuI'
};

const gr = goodreads(myCredentials);

// Initalising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// *** GET Routes - display pages ***

// Root Route
app.get('/', function (req, res) {
    res.render('pages/index');
});

// *** POST Routes ***

// Root Route

app.post('/search', function (req, res) {
    var bookquery = req.body.book;
    console.log(bookquery);
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

app.get('/book', function (req, res) {
    var bookid = gr.showBook('256683');
    bookid.then(function (result) {
        var bookdetails = result.book;
        console.log(bookdetails);
        res.render('pages/book', {
            bookdetails: bookdetails
        });
    });
});

app.listen(8080);
console.log('Listening on 8080');

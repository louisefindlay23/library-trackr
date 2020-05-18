// Node Modules
const express = require('express');
const app = express();
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

// *** GET Routes - display pages ***

// Root Route
app.get('/', function (req, res) {
    var book = gr.searchBooks({
        q: 'A song of ice and fire',
        page: 1,
        field: 'title'
    });
    book.then(function (result) {
        var bookresult = JSON.stringify(result.search.results.work);
        console.log(bookresult);
        res.render('pages/index', {
            bookresult: bookresult
        });
    });
});
app.listen(8080);
console.log('Listening on 8080');

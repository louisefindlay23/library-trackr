// Node Modules
const express = require('express');
const app = express();
const ejs = require('ejs');

// Initalising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

// *** GET Routes - display pages ***

// Root Route
app.get('/', function (req, res) {
    res.render("pages/index");
});

app.listen(8080);
console.log('Listening on 8080');

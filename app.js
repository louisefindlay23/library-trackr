// Node Modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const goodreads = require('goodreads-api-node');
const app = express();

// Goodreads API - NodeJS

const myCredentials = {
    key: 'LDomy4VKhZXCrcE3rJ8TQ',
    secret: ' xCaCeVJvD5G7mbfu7FgEg0nyzFKl6WK63ph4CGLQuI'
};

var callbackURL = "http://127.0.0.1/goodreads";
const gr = goodreads(myCredentials, callbackURL);

// Initalising Express

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(session({
    secret: 'truth will',
    resave: true,
    saveUninitialized: true
}));

app.get("/authenticate", function (req, res) {
    gr.getRequestToken()
        .then(url => {
            console.log(url);
            res.redirect(url);
        }).catch(function () {
            console.log("Promise Rejected");
        });
});

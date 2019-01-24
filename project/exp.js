var express = require('express'),
app= express.Router()
var bodyparser = require('body-parser');
var path    = require("path");
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.post('/cq', function(req, res){
     res.render('test');
});
module.exports = app
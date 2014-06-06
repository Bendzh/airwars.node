var express = require('express');
var http = require('http');

var app = express();
app.set('port', process.env.PORT || 80);

var server = http.Server(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

var io = require('socket.io')(server);
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var airwar = require('./serverLogic');

// view engine setup
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', function(req, res){
    res.render('index', {
        title: 'AirWars',
        helloMsg: 'our Sky'
    });
});

io.on('connection', function(socket){
    airwar._init(io, socket);
});
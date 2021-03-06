var express = require('express');

function getApp(middleware) {
    var app = express();
    app.use(middleware);
    app.get('/', function(req, res) {
        res.send('<html><body><p id="content"></p>' + 
            '<script>document.getElementById("content").innerHTML="hello " + "world";</script>' +
            '<script>console.log("hai")</script>' +
            '</body></html>');
    });
    app.get('/other', function(req, res) {
        res.send('<html><body><p id="content"></p>' + 
            '<script>document.getElementById("content").innerHTML="other " + "world";</script>' +
            '</body></html>');
    });
    app.get('/printhref', function(req, res) {
        res.send('<html><body><p id="content"></p>' + 
            '<script>document.getElementById("content").innerHTML="loc is " + "/printhref" + location.href.split("/printhref")[1];</script>' +
            '</body></html>');
    });
    return app;
}

module.exports = getApp;
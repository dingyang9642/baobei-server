var express = require('express');
var appIndexApi = express();
var wxControl = require('../control/wx');

appIndexApi.get('/test', function(req, res) {
    wxControl.starSpider();
    res.json({
        "name": 'dingyang',
        "age": '27'
    });
});

module.exports = appIndexApi;

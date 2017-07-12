var express = require('express');
var appWXApi = express();
// var wxControl = require('../control/wx');

appWXApi.get('/', function(req, res) {
    // wxControl.starSpider(function(){
    // 	res.json({
    // 		msg: '爬虫结束'
    // 	});
    // });

    res.json({
    	msg: '爬虫结束'
    });
});

module.exports = appWXApi;

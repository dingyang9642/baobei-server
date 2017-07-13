var express = require('express');
var appWXApi = express();
var wxControl = require('../control/wx');


appWXApi.get('/startTaskSpider', function(req, res) {
    wxControl.startSchedule();
    res.json({
    	msg: '启动定时任务-爬虫...'
    });
});

appWXApi.get('/stopTaskSpider', function(req, res) {
    wxControl.cancelSchedule();
    res.json({
    	msg: '关闭定时任务-爬虫...'
    });
});

appWXApi.get('/start', function(req, res) {
    wxControl.starSpider(function(data){
        res.json(data);       
    });
});

module.exports = appWXApi;

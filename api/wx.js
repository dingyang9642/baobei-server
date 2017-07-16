var express = require('express');
var appWXApi = express();
var wxControl = require('../control/wx');

// 开始数据爬虫定时任务
appWXApi.get('/startTaskSpider', function(req, res) {
    wxControl.startSchedule();
    res.json({
    	msg: '启动定时任务-爬虫...'
    });
});

// 停止数据爬虫定时任务
appWXApi.get('/stopTaskSpider', function(req, res) {
    wxControl.cancelSchedule();
    res.json({
    	msg: '关闭定时任务-爬虫...'
    });
});

// 开始爬取代码
appWXApi.get('/start', function(req, res) {
    wxControl.starSpider(function(data){
        res.json(data);
    });
});

// 获取数据库中所有文章列表
appWXApi.get('/getArticlesByType', function(req, res) {
    var articleType = req.query.type;
    wxControl.getArticlesByType(articleType, function(data){
        res.json(data);
    });
});

// 获取数据库中所有文章列表
appWXApi.get('/getArticlesWithPage', function(req, res) {
    var articleType = req.query.type;
    var pageNum = req.query.pageNum;
    var pageSize = req.query.pageSize;
    wxControl.getArticlesWithPage(articleType, pageNum, pageSize, function(data){
        res.json(data);
    });
});

// 通过文章id获取文章信息
appWXApi.get('/getArticleById', function(req, res) {
    var articleId = req.query.id;
    wxControl.getArticleInfoById(articleId, function(data){
        res.json(data);
    });
});

module.exports = appWXApi;

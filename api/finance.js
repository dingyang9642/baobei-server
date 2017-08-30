var express = require('express');
var appFinanceApi = express();
var financeControl = require('../control/finance');

// 开始数据爬虫定时任务
appFinanceApi.get('/start', function(req, res) {
	// 1、获取请求参数
	var dataCount = req.query.count || '1';
    financeControl.addDatasToDB(dataCount, 0);
    res.json({
    	msg: '启动爬虫...'
    });
});

// 开始数据爬虫定时任务
appFinanceApi.get('/startTaskSpider', function(req, res) {
	// 1、获取请求参数
	var dataCount = req.query.count || '1';
    financeControl.startSchedule(dataCount);
    res.json({
    	msg: '启动定时任务-爬虫...'
    });
});

// 停止数据爬虫定时任务
appFinanceApi.get('/stopTaskSpider', function(req, res) {
    financeControl.cancelSchedule();
    res.json({
    	msg: '关闭定时任务-爬虫...'
    });
});

// 获取某只股票k线数据
appFinanceApi.get('/getResultWithCode', function(req, res) {
    var code = req.query.code || 'sz300128';
    financeControl.getDayKlineDatas(code, function(data){
        res.json(data);
    });
});

module.exports = appFinanceApi;

var express = require('express');
var appFinanceApi = express();
var financeControl = require('../control/finance');

appFinanceApi.get('/getKData', function(req, res) {
	var gupiaoNum = req.query.code;
	gupiaoNum = gupiaoNum || 'sh603599';
	financeControl.getKData({
		type: 'day',
    	gupiaoNum: gupiaoNum,
    	count: '40',
    	callback: function(data){
            res.json(data);
    	}
	});
});
appFinanceApi.get('/gupiao', function(req, res) {
	var gupiaoType = req.query.type;
	gupiaoType = gupiaoType || 'szc';
	financeControl.getAllDatas({
		gupiaoType: gupiaoType,
		type: 'day',
    	count: '40',
    	callback: function(data){
            res.json(data);
    	}
	}, 0, []);
});

module.exports = appFinanceApi;

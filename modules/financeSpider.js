var https = require('https');
var qryStr = require('querystring');
var COMMON = require('./common');
var MSGCODE = require('../conf/msgCode');

/**
 * 投资模块
 * @type {Object}
 */
var FINANCE_SPIDER = {
	/**
	 * [getKData description]
	 * @Author   dingyang   [dingyang@baidu.com]
	 * @DateTime 2017-08-19
	 * @param    {string}   type                 day/week/month，默认day
	 * @return   {[type]}                        [description]
	 */
    getKData: function(options) {
    	type = options.type || 'day';
    	gupiaoNum = options.gupiaoNum || 'sh603599';
    	count = options.count || '1';
    	callback = options.callback || function(){};
    	var data = {   // 这是需要提交的数据
    		from: 'pc',
    		os_ver: '1',
    		cuid: 'xxx',
    		vv: '100',
    		format: 'json',
    		stock_code : gupiaoNum,
    		step: '3',
    		count: count,
    		fq_type: 'no',
    		timestamp: new Date().getTime()
        };  
        var content = qryStr.stringify(data);
		var options = {  
		    hostname: 'gupiao.baidu.com',  
		    port: 443,  
		    path: '/api/stocks/stockdaybar?' + content,
		    method: 'GET'  
		};
		var req = https.request(options, function (res) {  
	        var datas = ''; 
	        res.on('data', function (data) {  
	            datas += data;
	        });  
	        res.on("end", function () {
                var result = JSON.parse(datas);
                if(result.errorNo == 0) {
                    var formatResult = COMMON.formatResult(MSGCODE.SUCCESS_CODE, MSGCODE.SUCCESS_MSG, result.mashData);
		            callback && callback(formatResult);
                } else {
                	console.log('finance spider data error');
                	var formatResult = COMMON.formatResult(MSGCODE.BAIDU_GUPIAO_DATA_ERROR_CODE, MSGCODE.BAIDU_GUPIAO_DATA_ERROR_MSG, {});
		            callback && callback(formatResult);
                }
	        }); 
		});
		req.on('error', function (e) {
			console.log('problem with request: ' + e.message);  
		    var formatResult = COMMON.formatResult(MSGCODE.NETWORK_ERROR_CODE, MSGCODE.NETWORK_ERROR_MSG, {});
		    callback && callback(formatResult);
		});
        req.end(); 
    }
};

module.exports = FINANCE_SPIDER;
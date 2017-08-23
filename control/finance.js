var COMMON = require('./common');
var COMMONBUSINESS = require('../modules/common');
var MSGCODE = require('../conf/msgCode');
var APPCONFIG = require('../conf/conf');
var financeSpider = require('../modules/financeSpider');
var ToolUtil = require('../lib/tools');     // 基本工具库对象
var allGuPiaoCodesSh = APPCONFIG.gupiaoCodesSh.split(',');
var allGuPiaoCodesSzc = APPCONFIG.gupiaoCodesSzc.split(',');
var allGuPiaoCodesSz = APPCONFIG.gupiaoCodesSz.split(',');

/**
 * 金融相关操作控制层
 * @type {Object}
 */
var financeControl = {
    getKData: function(options) {
    	var self = this;
    	var resultCallback = options.callback;
        var gupiaoNum = options.gupiaoNum;
    	var newOptions =  ToolUtil.deepCopy(options, {});
    	newOptions.callback = function(data) {
    		if (data.resultCode == 0) {
                self.lowerShadowBuy(data.result, gupiaoNum, resultCallback);
    		} else {
                resultCallback && resultCallback(data);
    		}
    	};
    	financeSpider.getKData(newOptions);
    },
    // 下影线长度大于等于实体长度2倍【有效下影线】
    lowerShadowBuy: function(kDatas, code, callback) {
        var len = kDatas.length;
        var num = 0;
        var validData = [];
        var currentPrice = kDatas[0].kline.close;
        for (var i = 0; i < len; i++) {
        	var tmpData = kDatas[i];
            var openPrice = tmpData.kline.open,
			    highPrice = tmpData.kline.high,
			    lowPrice = tmpData.kline.low,
			    closePrice = tmpData.kline.close;
            var barHeight = Math.abs(openPrice - closePrice);
            var lowerShadowHeight = Math.min(Math.abs(lowPrice - closePrice), Math.abs(lowPrice - openPrice));
            if (lowerShadowHeight >= barHeight * 2) {
            	num++; // 计数加一
            	validData.push(tmpData);
            }
        }
        if (num > 0) {
            var formatResult = COMMONBUSINESS.formatResult(MSGCODE.SUCCESS_CODE, MSGCODE.SUCCESS_MSG, {lowerShadowCount: num, code: code, data: validData});
		    callback && callback(formatResult);
        } else {
            console.log('该股票不符合选股条件');
            var formatResult = COMMONBUSINESS.formatResult(MSGCODE.GUPIAO_INVALID_CODE, MSGCODE.GUPIAO_INVALID_MSG, {});
		    callback && callback(formatResult);        	
        }
    },
    
    getAllDatas: function(options, currentIndex, datas) {
    	var self = this;
    	var gupiaoType = options.gupiaoType;
    	var allGuPiaoCodes = (gupiaoType == 'sh') ? allGuPiaoCodesSh : ((gupiaoType == 'szc') ? allGuPiaoCodesSzc : allGuPiaoCodesSz);
        var len = allGuPiaoCodes.length;
        if((currentIndex + 1) == len) {
            // 说明请求结束
            var formatResult = COMMONBUSINESS.formatResult(MSGCODE.SUCCESS_CODE, MSGCODE.SUCCESS_MSG, datas);
            options.callback && options.callback(formatResult);
        } else {
            // 说明请求没有结束
            var tmpCode = allGuPiaoCodes[currentIndex];
            console.log("爬虫日志：", currentIndex, tmpCode);
            // 避免被进口禁掉
            setTimeout(function(){
                self.getKData({
                    type: options.type || 'day',
                    gupiaoNum: tmpCode,
                    count: options.count || '40',
                    callback: function(data){
                        if(data.resultCode == 0) {
                            datas.push(data.result);
                        }
                        currentIndex++
                        self.getAllDatas(options, currentIndex, datas);
                    }
                });                
            }, 1000);

        }
    },
     

};

module.exports = financeControl;
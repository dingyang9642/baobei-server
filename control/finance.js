var COMMON = require('./common');
var schedule = require("node-schedule");
var COMMONBUSINESS = require('../modules/common');
var financeDB = require('../modules/finance');
var MSGCODE = require('../conf/msgCode');
var APPCONFIG = require('../conf/conf');
var financeSpider = require('../modules/financeSpider');
var ToolUtil = require('../lib/tools');     // 基本工具库对象

var allGuPiaoCodes = APPCONFIG.gupiaoCodes.split(',');

/**
 * 金融相关操作控制层
 * @type {Object}
 */
var financeControl = {
    // 定时任务
    _scheduleId: null,
    /**
     * 定时任务启动
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-13
     * @return   {[type]}   [description]
     */
    startSchedule: function(dataCount) {
        var _this = this;
        // 首先需要中止任务
        _this.cancelSchedule();
        // 配置定时任务
        var rule = new schedule.RecurrenceRule();
        rule.minute = 30;
        // 定时任务启动
        _this._scheduleId = schedule.scheduleJob(rule, function(){
            _this.addDatasToDB(dataCount, 0);
        });
    },
    /**
     * 关闭定时任务
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-13
     * @return   {[type]}   [description]
     */
    cancelSchedule: function() {
        var _this = this;
        if (_this._scheduleId) {
            _this._scheduleId.cancel();
            _this._scheduleId = null;
        }
    },
    addDatasToDB: function(dataCount, currentIndex) {
        var self = this;
        var len = allGuPiaoCodes.length;
        if(currentIndex == len) {
            // 说明请求结束
            console.log('down');
        } else {
            // 说明请求没有结束
            var tmpCode = allGuPiaoCodes[currentIndex];
            console.log("爬虫日志：", currentIndex, tmpCode);
            // 避免被进口禁掉
            setTimeout(function(){
                self.addPerDataToDB({
                    type: 'day',
                    gupiaoNum: tmpCode,
                    count: dataCount,
                    callback: function(data){
                        currentIndex++
                        self.addDatasToDB(dataCount, currentIndex);
                    }
                });                
            }, 1000);
        }
    },
    addPerDataToDB: function(options) {
    	var self = this;
    	var resultCallback = options.callback;
        var gupiaoNum = options.gupiaoNum;
    	var newOptions =  ToolUtil.deepCopy(options, {});
    	newOptions.callback = function(data) {
    		if (data.resultCode == 0) {
                // 存入数据库
                financeDB.addDatas(data.result, gupiaoNum, resultCallback);
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
    }
    

     

};

module.exports = financeControl;
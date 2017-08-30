var financeSpider = require('./financeSpider');
var ToolUtil = require('../lib/tools');     // 基本工具库对象
var LOGGER = require('./logger');
var COMMON = require('./common');
var MSGCODE = require('../conf/msgCode');
var DB = require('./db');     // 基本工具库对象
/**
 * 投资模块
 * @type {Object}
 */
var FINANCE = {
    gupiaoKeys: 'code, date, open_price, high_price, low_price, close_price, volume, amount, ccl, pre_close, net_change_ratio, ma5_price, ma10_price, ma20_price, macd_diff, macd_dea, macd_macd, kdj_k, kdj_d, kdj_j',
    addDatas: function(datas, gupiaoNum, callback) {
        var self = this;
        var len = datas.length;
        var allValues = [];
        for (var i = 0; i < len; i++) {
            var tmpDatas = datas[i];
            var tmpValues = [
                gupiaoNum, tmpDatas.date, tmpDatas.kline.open,
                tmpDatas.kline.high, tmpDatas.kline.low, tmpDatas.kline.close,
                tmpDatas.kline.volume, tmpDatas.kline.amount, tmpDatas.kline.ccl,
                tmpDatas.kline.preClose, tmpDatas.kline.netChangeRatio,
                tmpDatas.ma5.avgPrice, tmpDatas.ma10.avgPrice, tmpDatas.ma20.avgPrice,
                tmpDatas.macd.diff, tmpDatas.macd.dea, tmpDatas.macd.macd,
                tmpDatas.kdj.k, tmpDatas.kdj.d, tmpDatas.kdj.j     
            ];
            var tmpValuesStr = ToolUtil.array2str(tmpValues, ',', true);
            allValues.push('('+ tmpValuesStr +')');
        }
        var finalValues = allValues.join(",");
        var sql = "replace into gupiao(" + self.gupiaoKeys + ") values" + finalValues + "";
        DB.insert(sql, function(data) {
            callback && callback(data);
        });
    },
    getDayKlineDatas: function(code, callback) {
        var sql = '';
        var codes = [code];
        if(!isNaN(parseInt(code, 10))) {
            codes = [code, 'sh' + code, 'sz' + code];
        }
        var tmpCodesStr = ToolUtil.array2str(codes, ',', true);
        var sql = "select * from gupiao where code in (" + tmpCodesStr + ") order by date desc limit 20";
        DB.select(sql, function(data) {
            callback && callback(data);
        });
    }
};

module.exports = FINANCE;
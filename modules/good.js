var ToolUtil = require('../lib/tools');     // 基本工具库对象
var LOGGER = require('./logger');
var COMMON = require('./common');
var MSGCODE = require('../conf/msgCode');
var DB = require('./db');     // 基本工具库对象

/**
 * 商品对象
 * @type {Object}
 */
var Good = {
    /**
     * 商品默认信息
     * @type {Object}
     */
    _defaultOptions: {

    },

    /**
     * 商品信息是否有效
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-08
     * @param    {object}   goodInfo             商品信息
     * @return   {object}                        返回结果
     */
    _isLegaGoodIno: function(goodInfo) {
        var formatResult = {};
        return {flag: true, result: formatResult};
    },

    /**
     * 添加商品信息
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-08
     * @param    {object}   options              商品信息
     * @param    {Function} callback             添加商品信息回调函数
     */
    addGood: function(options, callback) {
        var defaultOptions = this._defaultOptions;
        var newOptions = ToolUtil.extend(defaultOptions, options);
        // 一、校验异常
        var verifyResult = this._isLegaGoodIno(newOptions);
        if (!verifyResult.flag) {
            callback && callback(verifyResult.result);
            return;
        }
        // 二、异常校验通过
        var newOptionsKeysAndValues = ToolUtil.getKeysAndValues(newOptions),
            keys = newOptionsKeysAndValues.keys.join(','),
            values = ToolUtil.array2str(newOptionsKeysAndValues.values, ',', true);
        var sql = "insert into mall_goods(" + keys + ") values(" + values + ")";
        DB.insert(sql, function(data) {
            callback && callback(data);
        });
    },
};

module.exports = Good;
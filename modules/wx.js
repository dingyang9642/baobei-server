var ToolUtil = require('../lib/tools');     // 基本工具库对象
var LOGGER = require('./logger');
var COMMON = require('./common');
var MSGCODE = require('../conf/msgCode');
var DB = require('./db');     // 基本工具库对象

/**
 * 微信数据库操作对象
 * @type {Object}
 */
var WX_CAIJING = {
    /**
     * 用户默认信息
     * @type {Object}
     */
    _defaultOptions: {
        title: '',         // 文章标题 string
        url: '',           // 文章url string
        read_num: 0,       // 文章阅读数 int
        like_num: 0,       // 文章点赞数 int
        release_time: 0,   // 文章发布时间，datetime
        author: '',        // 文章作者 string
        wechat_number: '', // 文章公众号 string
        flag: 1            // 选填，默认1，启用状态 int
    },

    /**
     * @description 微信信息校验
     * @dateTime    2017-05-12
     * @param       {[type]}   wxInfo   [description]
     * @return      {Boolean}           [description]
     */
    _isLegalWXIno: function(wxInfo) {
        var formatResult = {};
        return {flag: true, result: formatResult};
    },

    /**
     * @description 与getArticleInfoById函数关联，对返回数据格式进行处理
     * @dateTime    2017-05-15
     * @param       {object}   data getArticleInfoById函数接收的查询返回数据
     * @return      {object}        格式化后的数据
     */
    _formatArticleInfoData: function(data) {
        var formatResult = {};
        if (data.resultCode === '0') {
            // 说明查询正确
            if (data.result.length === 0) {
                formatResult = COMMON.formatResult(MSGCODE.QUERYWX_ARTICLE_NOT_EXIT_CODE, MSGCODE.QUERYWX_ARTICLE_NOT_EXIT_MSG, {});
            } else {
                formatResult = COMMON.formatResult(data.resultCode, data.resultMsg, data.result[0]);
            }
        } else {
            // 说明查询异常
            formatResult = COMMON.formatResult(data.resultCode, data.resultMsg, {});
        }
        return formatResult;
    },

    _filterAddArticles: function(articleArr) {
        var defaultOptions = this._defaultOptions;
        var arTicleslength = articleArr.length;
        var atTiclesStrValues = [];
        for (var i = 0; i < arTicleslength; i++) {
            var tmpArticleOptions = articleArr[i];
            var newOptions = ToolUtil.extend(defaultOptions, tmpArticleOptions);
            // 一、校验异常
            var verifyResult = this._isLegalWXIno(newOptions);
            if (!verifyResult.flag) {
                contin;
            }
        }
    },
    
    /**
     * @description 文章添加操作
     * @dateTime    2017-05-11
     * @param       {array}   articleArr  文章数组[{},{}]
     * @param       {Function} callback 回调函数
     */
    addArticles: function(articleArr, callback) {
        var _this = this;
        var defaultOptions = _this._defaultOptions;
        var articlesLength = articleArr.length;
        var keys = "", allValues = [];
        // 一、判断数组长度是否为空
        if (articlesLength === 0) {
            var errorResult = COMMON.formatResult(MSGCODE.ADDWX_ARTICLE_EMPTY_CODE, MSGCODE.ADDWX_ARTICLE_EMPTY_MSG, {});
            callback && callback(errorResult);
            return;
        }
        // 二、校验每一项是否正确
        for (var i = 0; i < articlesLength; i++) {
            var tmpArticleOptions = articleArr[i];
            var newOptions = ToolUtil.extend(defaultOptions, tmpArticleOptions);
            var verifyResult = _this._isLegalWXIno(newOptions);
            if (!verifyResult.flag) {
                callback && callback(verifyResult.result);
                return;
            }
            var newOptionsKeysAndValues = ToolUtil.getKeysAndValues(newOptions),
                tmpKeys = newOptionsKeysAndValues.keys.join(','),
                tmpValues = ToolUtil.array2str(newOptionsKeysAndValues.values, ',', true);
            keys = tmpKeys;
            allValues.push("(" + tmpValues + ")");
        }
        // 三、异常校验通过
        var finalValues = allValues.join(",");
        var sql = "insert into wx_caijing(" + keys + ") values" + finalValues + "";
        DB.insert(sql, function(data) {
            callback && callback(data);
        });
    },
    
    /**
     * @description 通过用户id删除文章【非物理删除，实际执行update操作】
     * @dateTime    2017-05-11
     * @param       {int}   _id         文章id
     * @param       {Function} callback 回调函数
     */
    deleteArticleById: function(_id, callback) {
        var sql = "update wx_caijing set flag=-1 where id=" + _id;
        DB.update(sql, function(data) {
            callback && callback(data);
        });
    },

    /**
     * @description 获取所有文章
     * @dateTime    2017-05-09
     * @return      {array}   返回文章数组列表
     */
    getAllArticles: function(callback) {
        var sql = "select * from wx_caijing";
        DB.select(sql, function(data) {
            callback && callback(data);
        });
    },
    
    /**
     * @description 通过文章id获取文章信息
     * @dateTime    2017-05-09
     * @param       {string}   _id 文章id
     * @return      {object}   文章信息 {ret: '0', data: {}}
     */
    getArticleInfoById: function(_id, callback) {
        var self = this;
        var sql = "select * from wx_caijing where id=" + _id;
        DB.select(sql, function(data) {
            // 统一返回格式
            var newData = self._formatArticleInfoData(data);
            callback && callback(newData);
        });
    }
};

module.exports = WX_CAIJING;
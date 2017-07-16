var ToolUtil = require('../lib/tools');     // 基本工具库对象
var LOGGER = require('./logger');
var COMMON = require('./common');
var MSGCODE = require('../conf/msgCode');
var DB = require('./db');     // 基本工具库对象

/**
 * 微信数据库操作对象
 * @type {Object}
 */
var WX_ARTICLE = {
    /**
     * 用户默认信息
     * @type {Object}
     */
    _defaultOptions: {
        title: '',         // 文章标题 string
        abstract: '',      // 文章摘要
        type: '',          // 文章分类
        url: '',           // 文章url string
        thumb_nail:'',     // 文章缩略图
        read_num: 0,       // 文章阅读数 int
        like_num: 0,       // 文章点赞数 int
        release_time: '',   // 文章发布时间，datetime
        author: '',        // 文章作者 string
        wechat_number: '', // 文章公众号 string
        create_time: ToolUtil.getNowFormatDate(),
        update_time: ToolUtil.getNowFormatDate(),
        flag: 1            // 选填，默认1，启用状态 int
    },

    /**
     * @description 微信信息校验
     * @dateTime    2017-05-12
     * @param       {[type]}   wxInfo   [description]
     * @return      {Boolean}           [description]
     */
    _isLegalWXInfo: function(wxInfo) {
        var formatResult = {};
        if (wxInfo.title === "" || wxInfo.abstract === "" || wxInfo.release_time === "") {
            formatResult = COMMON.formatResult(MSGCODE.ADDWX_ARTICLE_DATA_ILLEGAL_CODE, MSGCODE.ADDWX_ARTICLE_DATA_ILLEGAL_MSG, {});
            return {flag: false, result: formatResult};
        } 
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

    /**
     * 根据文章列表返回列表标题数组
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-13
     * @param    {[type]}   articleArr           [description]
     * @return   {[type]}                        [description]
     */
    _getArticleTitlesByArticles: function(articleArr) {
        var articlesLength = articleArr.length;
        var results = [];
        for (var i = 0; i < articlesLength; i++) {
            results.push(articleArr[i]["title"]);
        }
        return results;
    },

    /**
     * 根据文章标题集合获取数据库中存在的标题
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-13
     * @param    {array}   articleTitles         [description]
     * @return   {[type]}                        [description]
     */
    _getExitArticleTitlesByArticlesTitles: function(articleTitles, callback) {
        var titlesStr = ToolUtil.array2str(articleTitles, ',', true);;
        var sql = "select title from wx_articles where title in (" + titlesStr + ")";
        DB.select(sql, function(data) {
            callback && callback(data);
        });
    },

    _filterArticles: function(articleArr, exitArticleTitles) {
        var articlesLength = articleArr.length;
        var exitArticleTitlesLength = exitArticleTitles.length;
        var afterExitArticleTitles = [];
        var afterResults = [];
        // 首先对数据查询结果进行初步数据处理，数组形式
        for (var i = 0; i < exitArticleTitlesLength; i++) {
            var tmpTitle = exitArticleTitles[i]["title"];
            afterExitArticleTitles.push(tmpTitle);
        }
        // 然后进行数据筛选
        for (var j = 0; j < articlesLength; j++) {
            var tmpArticle = articleArr[j];
            if (afterExitArticleTitles.indexOf(tmpArticle["title"]) >= 0) continue;
            afterResults.push(tmpArticle);
        }
        return afterResults;
    },

    addArticles: function(articleArr, callback) {
        var _this = this;
        // 判断是否数据为空
        if (articleArr.length === 0) {
            var errorResult = COMMON.formatResult(MSGCODE.ADDWX_ARTICLE_EMPTY_CODE, MSGCODE.ADDWX_ARTICLE_EMPTY_MSG, {});
            callback && callback(errorResult);
            return;
        }
        // 获取文章标题列表
        var articleTitles = _this._getArticleTitlesByArticles(articleArr);
        // 根据文章标题列表查询是否数据库中存在该条记录
        _this._getExitArticleTitlesByArticlesTitles(articleTitles, function(data){
            // 返回数据结果,然后进行去重处理
            if (data.resultCode === "0") {
                var results = data.result;
                var filterResults = _this._filterArticles(articleArr, results);
                _this._addArticlesToDB(filterResults, callback);
            } else {
                callback&&callback(data);
            }
        });
    },


    
    /**
     * @description 文章添加操作
     * @dateTime    2017-05-11
     * @param       {array}   articleArr  文章数组[{},{}]
     * @param       {Function} callback 回调函数
     */
    _addArticlesToDB: function(articleArr, callback) {
        var _this = this;
        var defaultOptions = _this._defaultOptions;
        var articlesLength = articleArr.length;
        var keys = "", allValues = [];
        // 一、校验每一项是否正确
        for (var i = 0; i < articlesLength; i++) {
            var tmpArticleOptions = articleArr[i];
            var newOptions = ToolUtil.extend(defaultOptions, tmpArticleOptions, true);
            var verifyResult = _this._isLegalWXInfo(newOptions);
            if (!verifyResult.flag) {
                console.log("存在数据不符合规范，已忽略");
                //callback && callback(verifyResult.result);
                //return;
                continue;
            }
            var newOptionsKeysAndValues = ToolUtil.getKeysAndValues(newOptions),
                tmpKeys = newOptionsKeysAndValues.keys.join(','),
                tmpValues = ToolUtil.array2str(newOptionsKeysAndValues.values, ',', true);
            keys = tmpKeys;
            allValues.push("(" + tmpValues + ")");
        }
        // 二、判断是否数据为空
        if (allValues.length === 0) {
            var errorResult = COMMON.formatResult(MSGCODE.ADDWX_ARTICLE_EMPTY_CODE, MSGCODE.ADDWX_ARTICLE_EMPTY_MSG, {});
            callback && callback(errorResult);
            return;
        }
        // 三、异常校验通过
        var finalValues = allValues.join(",");
        var sql = "insert into wx_articles(" + keys + ") values" + finalValues + "";
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
        var sql = "update wx_articles set flag=-1 where id=" + _id;
        DB.update(sql, function(data) {
            callback && callback(data);
        });
    },

    /**
     * @description 获取所有文章
     * @dateTime    2017-05-09
     * @return      {array}   返回文章数组列表
     */
    getArticlesByType: function(type, callback) {
        var sql = "select * from wx_articles where type='" + type + "' order by create_time";
        DB.select(sql, function(data) {
            callback && callback(data);
        });
    },

    /**
     * @description 获取所有文章[分页查询]
     * @dateTime    2017-05-09
     * @return      {array}   返回文章数组列表
     */
    getArticlesWithPage: function(type, pageNum, pageSize, callback) {
        var startIndex = (pageNum - 1) * pageSize;
        var sql = "select * from wx_articles where type='" + type + "' order by create_time limit " + startIndex + "," + pageSize;
        DB.select(sql, function(data) {
            if (data.resultCode === "0") {
                var countSql = "select count(id) from wx_articles where type='" + type + "'";
                DB.select(countSql, function(countData) {
                    if (countData.resultCode === "0") {
                        var countNumber = countData.result[0]["count(id)"];
                        var newResult = {};
                        newResult.articles = data.result;
                        newResult.pagination = {
                            pageNum: pageNum,
                            pageSize: pageSize,
                            totalCount: countNumber
                        };
                        data.result = newResult;
                        callback && callback(data);
                    } else {
                        callback && callback(countData);
                    }
                });
            } else {
                callback && callback(data);
            }
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
        var sql = "select * from wx_articles where id=" + _id;
        DB.select(sql, function(data) {
            // 统一返回格式
            var newData = self._formatArticleInfoData(data);
            callback && callback(newData);
        });
    }

};

module.exports = WX_ARTICLE;
var wxSpider = require('../modules/wxSpider.js');
var schedule = require("node-schedule");
var wxDB = require('../modules/wx.js');
var APPCONFIG = require('../conf/conf');
var async = require('async');
// 微信公众号数组
var WX_PUBLIC_ACCOUNTS = APPCONFIG.WX_PUBLIC_ACCOUNTS;

/**
 * 微信数据爬虫
 * @type {Object}
 */
var wxControl = {
    // 定时任务
    _scheduleId: null,
    /**
     * 定时任务启动
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-13
     * @return   {[type]}   [description]
     */
    startSchedule: function() {
        var _this = this;
        // 首先需要中止任务
        _this.cancelSchedule();
        // 配置定时任务
        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(1, 6)];
        rule.hour = 1;
        rule.minute = 0;
        // 定时任务启动
        _this._scheduleId = schedule.scheduleJob(rule, function(){
            _this.starSpider(function(data){
                console.log("爬虫结果为：" + JSON.stringify(data));
            });
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

    _finalResults: [],
    /**
     * 获取爬虫任务
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-12
     * @param    {[type]}   wxPublicName         [description]
     * @return   {[type]}                        [description]
     */
    _getTasks: function(wxPublicName, wxPublicNameType) {
        wxPublicName = wxPublicName || "上海";
        wxPublicNameType = wxPublicNameType || "";
        return [
            // 搜索公众号,最好是微信号或者微信全名
            function(callback) {
                wxSpider.search_wechat(wxPublicName, wxPublicNameType, callback);
            },
            // 根据url获取公众号获取最后5条图文列表
            function(url, callback) {
                wxSpider.look_wechat_by_url(url, callback);
            },
            // 根据图文url获取详细信息,发布日期,作者,公众号,阅读量,点赞量等
            function(article_titles, article_urls, article_pub_times, callback) {
                wxSpider.get_info_by_url(article_titles, article_urls, article_pub_times, callback);
            }
        ];
    },

    starSpider: function(callback) {
        this._finalResults = [];
        this.subStarSpider(0, callback);
    },

    /**
     * 开始启动爬虫【任务应用】
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-12
     * @param    {[type]}   startIndex           [description]
     * @param    {Function} callback             [description]
     * @return   {[type]}                        [description]
     */
    subStarSpider: function(startIndex, callback) {
        var _this = this;
        var accountsLength = WX_PUBLIC_ACCOUNTS.length;
        if (accountsLength === 0) {
            callback&&callback();
            return;
        }
        console.log("开始爬取微信公众号：" + WX_PUBLIC_ACCOUNTS[startIndex]["name"]);
        var _tasks = _this._getTasks(WX_PUBLIC_ACCOUNTS[startIndex]["name"], WX_PUBLIC_ACCOUNTS[startIndex]["type"]);
        async.waterfall(_tasks, function(err, result) {
            // 如果中途有错误，输出错误信息
            if (err) {
                console.log(err);
            } else {
                _this._finalResults = _this._finalResults.concat(result);
            }
            // 然后继续执行后续操作
            if (startIndex === (accountsLength - 1)) {
                wxDB.addArticles(_this._finalResults, callback);
            } else {
                var newStartIndex = startIndex + 1;
                _this.subStarSpider(newStartIndex, callback);
            }
        });
    },

    /**
     * 获取所有文章
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-16
     * @param    {Function} callback             [description]
     * @return   {[type]}                        [description]
     */
    getArticlesByType: function(type, callback) {
        wxDB.getArticlesByType(type, callback);
    },

    /**
     * 通过type并且分页获取数据
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-16
     * @param    {[type]}   type                 [description]
     * @param    {[type]}   pageNum              [description]
     * @param    {[type]}   pageSize             [description]
     * @param    {Function} callback             [description]
     * @return   {[type]}                        [description]
     */
    getArticlesWithPage: function(type, pageNum, pageSize, callback) {
        wxDB.getArticlesWithPage(type, pageNum, pageSize, callback);
    },

    /**
     * 通过文章id获取文章内容
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-16
     * @param    {[type]}   _id                  [description]
     * @param    {Function} callback             [description]
     * @return   {[type]}                        [description]
     */
    getArticleInfoById: function(_id, callback) {
        wxDB.getArticleInfoById(_id, callback);
    }
};

module.exports = wxControl;
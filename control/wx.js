var wxSpider = require('../modules/wxSpider.js');
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
    _finalResults: [],
    /**
     * 获取爬虫任务
     * @Author   dingyang   [dingyang@baidu.com]
     * @DateTime 2017-07-12
     * @param    {[type]}   wxPublicName         [description]
     * @return   {[type]}                        [description]
     */
    _getTasks: function(wxPublicName) {
        wxPublicName = wxPublicName || "上海";
        return [
            // 搜索公众号,最好是微信号或者微信全名
            function(callback) {
                wxSpider.search_wechat(wxPublicName, callback);
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
        var _tasks = _this._getTasks(WX_PUBLIC_ACCOUNTS[startIndex]);
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
                console.log("ssssss");
                var newStartIndex = startIndex + 1;
                _this.subStarSpider(newStartIndex, callback);
            }
        });
    }
};

module.exports = wxControl;
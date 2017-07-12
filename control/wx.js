var wxSpider = require('../modules/wxSpider.js');
var APPCONFIG = require('../conf/conf');
var async = require('async');

/**
 * 微信数据爬虫
 * @type {Object}
 */
var wxControl = {
    getTasks: function(wxPublicName) {
        wxPublicName = wxPublicName || "上海";
        return [
            // 搜索公众号,最好是微信号或者微信全名
            function(callback) {
                wxSpider.search_wechat(wxPublicName, callback)
            },
            // 根据url获取公众号获取最后5条图文列表
            function(url, callback) {
                wxSpider.look_wechat_by_url(url, callback)
            },
            // 根据图文url获取详细信息,发布日期,作者,公众号,阅读量,点赞量等
            function(article_titles, article_urls, article_pub_times, callback) {
                wxSpider.get_info_by_url(article_titles, article_urls, article_pub_times, callback)
            }
        ]
    },
    starSpider: function() {
        var _tasks = this.getTasks("百思心情");
        async.waterfall(_tasks, function(err, result) {
            if (err) return console.log(err);
            console.log(result);
        });
    }
};

module.exports = wxControl;
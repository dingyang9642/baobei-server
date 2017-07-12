var wxSpider = require('../modules/wxSpider.js');
var async = require('async');

/**
 * 微信数据爬虫
 * @type {Object}
 */
var wxControl = {
    _wxName: "支付宝",
    _tasks: [
        // 根据public_num搜索公众号,最好是微信号或者微信全名
        function(callback) {
            wxSpider.search_wechat("支付宝", callback)
        },
        // 根据url获取公众号获取最后10条图文列表
        function(url, callback) {
            wxSpider.look_wechat_by_url(url, callback)
        },
        // 根据图文url获取详细信息,发布日期,作者,公众号,阅读量,点赞量等
        function(article_titles, article_urls, article_pub_times, callback) {
            wxSpider.get_info_by_url(article_titles, article_urls, article_pub_times, callback)
        }
    ],
    starSpider: function() {
    	var _this = this;
        async.waterfall(_this._tasks, function(err, result) {
            if (err) return console.log(err);
            console.log(result);
        });
    }
};

module.exports = wxControl;
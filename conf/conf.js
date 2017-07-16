/**
 * 项目相关配置项
 * @type {Object}
 */
/*
  1、进入终端
     mysql -u root -p
  2、服务启动与终止
     $ sudo /usr/local/mysql/support-files/mysql.server start
     $ sudo /usr/local/mysql/support-files/mysql.server stop
 */
var CONFIG = {
    // 数据数据库配置项
    "DB": {
        "HOST"      : "localhost",     // 数据库域名
        "USER"      : "root",          // 数据录登录用户名
        "PASS"      : "root",          // 数据库登录密码
        "PORT"      : "3306",          // 数据录登录端口
        "DATABASE"  : "baobei"         // 数据库名
    },
    "WX_PUBLIC_ACCOUNTS": [
        {
          "type": "caijing",
          "name": "金海实盘"
        }, {
          "type": "caijing",
          "name": "今日牛股"
        }, {
          "type": "caijing",
          "name": "涨停大队"
        }, {
          "type": "caijing",
          "name": "股市看盘"
        }, {
          "type": "caijing",
          "name": "郎club"
        }, {
          "type": "caijing",
          "name": "今日股票热点"
        }, {
          "type": "caijing",
          "name": "波段笔记"
        }, {
          "type": "lvtu",
          "name": "Feekr旅行"
        }, {
          "type": "lvtu",
          "name": "众信旅游"
        }, {
          "type": "lvtu",
          "name": "环球旅行摄影频道"
        }, {
          "type": "lvtu",
          "name": "ilvxingcom"
        }, {
          "type": "wangzherongyao",
          "name": "王者荣耀"
        }
    ]
};

module.exports = CONFIG;